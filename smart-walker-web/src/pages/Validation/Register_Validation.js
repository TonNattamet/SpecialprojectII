function Validation(values) {
  let error = {};

  const email_pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const password_pattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,}$/;
  const phone_pattern = /^[0-9]{10}$/;  // ตรวจสอบเบอร์โทรศัพท์ 10 หลัก
  const height_pattern = /^[1-9][0-9]{1,2}$/;  // ตรวจสอบส่วนสูง (1-3 หลัก)
  const weight_pattern = /^[1-9][0-9]{1,2}$/;  // ตรวจสอบน้ำหนัก (1-3 หลัก)

  const deviceID1_pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const deviceID2_pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // ตรวจสอบชื่อ
  if (values.name === "") {
    error.name = "กรุณาใส่ชื่อ"
  } else {
    error.name = ""
  }

  // ตรวจสอบอีเมล
  if (values.email === "") {
    error.email = "กรุณาใส่ email"
  } else if (!email_pattern.test(values.email)) {
    error.email = "ไม่พบ email"
  } else {
    error.email = ""
  }

  // ตรวจสอบรหัสผ่าน
  if (values.password === "") {
    error.password = "กรุณาใส่ password";
  } else if (!password_pattern.test(values.password)) {
    error.password = "password ไม่ถูกต้อง"
  } else {
    error.password = ""
  }

  // ตรวจสอบเบอร์โทรศัพท์
  if (values.phone === "") {
    error.phone = "กรุณาใส่เบอร์โทรศัพท์"
  } else if (!phone_pattern.test(values.phone)) {
    error.phone = "เบอร์โทรศัพท์ต้องมี 10 หลัก"
  } else {
    error.phone = ""
  }

  // ตรวจสอบส่วนสูง
  if (values.height === "") {
    error.height = "กรุณาใส่ส่วนสูง"
  } else if (!height_pattern.test(values.height)) {
    error.height = "ส่วนสูงไม่ถูกต้อง"
  } else {
    error.height = ""
  }

  // ตรวจสอบน้ำหนัก
  if (values.weight === "") {
    error.weight = "กรุณาใส่น้ำหนัก"
  } else if (!weight_pattern.test(values.weight)) {
    error.weight = "น้ำหนักไม่ถูกต้อง"
  } else {
    error.weight = ""
  }

  // ตรวจสอบ deviceID
  if (values.deviceID1 === "") {
    error.deviceID1 = "กรุณาใส่ deviceID1"
  } else if (!deviceID1_pattern.test(values.deviceID1)) {
    error.deviceID1 = "deviceID1 ไม่ถูกต้อง"
  } else {
    error.deviceID1 = ""
  }

  if (values.deviceID2 === "") {
    error.deviceID2 = "กรุณาใส่ deviceID2"
  } else if (!deviceID2_pattern.test(values.deviceID2)) {
    error.deviceID2 = "deviceID2 ไม่ถูกต้อง"
  } else {
    error.deviceID2 = ""
  }

  return error;
}

export default Validation;
