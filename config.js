export default {
  port: process.env.PORT || 3001,
  campusDualServiceAddr: process.env.CAMPUS_DUAL_SERVICE_ADDR || '127.0.0.1',
  campusDualServicePort: process.env.CAMPUS_DUAL_SERVICE_PORT || 4321,
  syncMinutes: process.env.CAMPUS_DUAL_SERVICE_SYNCMINUTES || 60
}
