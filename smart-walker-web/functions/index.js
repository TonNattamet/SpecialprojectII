const {onSchedule} = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const functions = require("firebase-functions");

admin.initializeApp();
const db = admin.firestore();


const getUserDataFromEmail = async (email) => {
  const userSnapshot = await db.collection("users").where("email", "==", email).get();
  if (userSnapshot.empty) {
    throw new Error(`User with email ${email} not found`);
  }
  const userDoc = userSnapshot.docs[0]; // assuming only one user with the given email
  return userDoc.data();
};

const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));

exports.fetchDistanceAndId = onSchedule("every 1 minutes", async (event) => {
  console.log("🕒 Scheduled function triggered");

  const email = "user@example.com";

  try {
    // ดึงข้อมูลผู้ใช้จาก Firestore ตามอีเมล
    const userData = await getUserDataFromEmail(email);
    const {deviceId2, deviceToken2, API_URL2} = userData;

    console.log(`🌐 Sending request to NETPIE with user data (deviceId: ${deviceId2})`);

    const response = await fetch(API_URL2, {
      method: "POST",
      headers: {
        "Authorization": `Device ${deviceId2}:${deviceToken2}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        start_relative: {value: 30, unit: "seconds"},
        metrics: [
          {
            name: deviceId2,
            tags: {attr: ["Distance1", "ID_Distance1"]},
            limit: 99,
          },
        ],
      }),
    });

    console.log("✅ Fetch succeeded. Parsing JSON...");

    const data = await response.json();
    const results = data.queries[0]?.results || [];

    const distances = [];
    const ids = [];

    // ดึงค่า Distance1 และ ID_Distance1
    results.forEach((result) => {
      const attr = result.tags?.attr?.[0];
      result.values.forEach(([timestamp, value]) => {
        if (attr === "Distance1") {
          distances.push({timestamp, value});
        } else if (attr === "ID_Distance1") {
          ids.push({timestamp, value});
        }
      });
    });

    // จับคู่ข้อมูลโดยใช้การจัดลำดับ (ตาม index)
    const combined = distances.map((dist, index) => {
      const match = ids[index]; // จับคู่ตามลำดับ
      return match ? {
        Distance1: dist.value,
        ID_Distance1: match.value,
        Timestamp: new Date(dist.timestamp),
      } : null;
    }).filter((item) => item !== null);

    // บันทึกข้อมูลใน Firestore
    if (combined.length > 0) {
      for (const entry of combined) {
        await db.collection("zzWalker").add(entry);
        console.log("✅ บันทึก:", entry);
      }
    } else {
      console.log("⛔️ ไม่พบคู่ข้อมูลที่ตรงกัน");
    }
  } catch (error) {
    console.error("❌ Error fetching from NETPIE:", error);
  }
});

const cors = require("cors")({origin: true});
exports.deleteUserByEmail = functions.https.onRequest(async (req, res) => {
  console.log("Request body:", req.body);
  cors(req, res, async () => {
    const userEmail = req.body.data.userEmail;
    console.log(" user with email:", userEmail);

    try {
      const userRecord = await admin.auth().getUserByEmail(userEmail);
      console.log("User found:", userRecord);
      const uid = userRecord.uid;
      console.log(`User UID: ${uid} will be deleted`);

      await admin.auth().deleteUser(uid);
      console.log("User successfully deleted");

      res.status(200).send({data: {message: "Deleted user"}});
    } catch (error) {
      console.error("Error fetching user", error);
      res.status(500).send({data: {error: "Failed to delete user"}});
    }
  });
});


const device1 = {
  Name: "Device1",
  id: "0e01f7ba-ce71-4f50-ba2c-88004562dea5",
  token: "915y5BmnrCoP5kNn7M16TpxGxSneWyB2",
  attr: ["SpeedValue1", "DelayValue1", "DistanceValue1", "Collision_count1", "Stage_now1"],
};


const device2 = {
  Name: "Device2",
  id: "2aa9bed5-8390-48f8-ae74-ce8e298a45d7",
  token: "eUssr683Dsh6R9YeBs8XE4TbZ2jBwWVC",
  attr: ["Heart_RateValue2", "StepValue2", "FallStatusValue2", "FarStatusValue2"],
};

/**
 * Fetch and combine feed data by timestamp for a device
 *
 * @param {Object} device - The device object containing id, token, and attributes
 * @param {string} device.Name - The name of the device
 * @param {string} device.id - The device ID used for authentication
 * @param {string} device.token - The device token used for authentication
 * @param {string[]} device.attr - The array of attribute names to fetch
 * @return {Promise<Object[]>} - An array of combined feed data objects grouped by timestamp
 */
async function fetchAndCombine(device) {
  const response = await fetch("https://api.netpie.io/v2/feed/api/v1/datapoints/query", {
    method: "POST",
    headers: {
      "Authorization": `Device ${device.id}:${device.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      start_relative: {value: 1, unit: "minutes"},
      metrics: device.attr.map((attr) => ({
        name: device.id,
        tags: {attr: [attr]},
        limit: 20,
      })),
    }),
  });

  const json = await response.json();
  const results = (json.queries || []).flatMap((q) => q.results || []);
  const groupedData = {};

  for (const result of results) {
    const attrs = result.tags?.attr || [];
    const values = result.values || [];

    for (const attr of attrs) {
      for (const [timestamp, value] of values) {
        if (!timestamp || value === undefined) continue;

        const isoTime = new Date(timestamp).toISOString();

        if (!groupedData[isoTime]) {
          groupedData[isoTime] = {
            Name: device.Name,
            deviceId: device.id,
            timestamp: new Date(timestamp),
          };
        }

        groupedData[isoTime][attr] = value;
      }
    }
  }

  return Object.values(groupedData);
}

/**
 * Scheduled function to run every 1 minute and store combined feed data
 */
exports.fetchFeedData_Final2 = onSchedule("every 1 minutes", async () => {
  try {
    const [combined1, combined2] = await Promise.all([
      fetchAndCombine(device1),
      fetchAndCombine(device2),
    ]);

    const allCombined = [...combined1, ...combined2];

    for (const entry of allCombined) {
      await db.collection("Final_FeedData2").add(entry);
      console.log(`✅ Saved: ${entry.Name} at ${entry.timestamp.toISOString()}`);
    }

    console.log(`✅ Total entries saved: ${allCombined.length}`);
  } catch (err) {
    console.error("❌ Error fetching feed data:", err);
  }
});
