// 月度定时任务
const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init({
    env: "cyr-8gbthlqn6c4254da"
})
// 初始化数据库
const db = cloud.database()
const _ = db.command
// 就诊记录集合
const visitRecordCollection = "visit-records"
// 静脉溶栓集合
const ivctCollection = "ivct"
// 血管内治疗集合
const evtCollection = "evt"
// 医护人员集合
const doctorCollection = "doctors"
// CT集合
const ctCollection = "ct"
// 心电图集合
const ecgCollection = "ecg"
// 血管内治疗集合
const evtCollection = "evt"
// 静脉榕树集合
const ivctCollection = "ivct"
// 化验检查集合
const leCollection = "laboratory-examination"
// mRS集合
const mRSCollection = "mrs"
// NIHSS集合
const NIHSSCollection = "nihss"
// 二线信息集合
const secondDoctorCollection = "secondline-doctor"
// 生命体征集合v
const vitalSignsCollection = "vital-signs"




exports.main = async function (event) {
    // 加载超时信息
    

    // 统计患者数据

    // 统计记录数

    // 统计工作人员数据
};


// 统计患者信息
async function patientsStat() {
    // 获取当前年月
    var now = new Date()
    var year = now.getFullYear()
    var month = now.getMonth()
    var startTime = new Date(year, month, 1)

    // 获取本月的患者数量
    var patients = await db.collection(visitRecordCollection).where({
        endTime: _.gte(startTime.toISOString()),
        state: true
    }).field({
        _id: true,
        visitTime: true
    }).get()

    // 获取死亡数量
    var deathCount = await db.collection(visitRecordCollection).where({
        endTime: _.gte(startTime.toISOString()),
        lastStep: "死亡"
    }).count()

    // 获取溶栓数量
    var ivctCount = await db.collection(ivctCollection).where({
        endTime: _.gte(startTime.toISOString())
    }).count()

    // 获取血管内治疗数量
    var evtCount = await db.collection(evtCollection).where({
        endTime: _.gte(startTime.toISOString())
    }).count()

    // 统计DNT信息
    var overTimeList = []
    var overTimeCount = 0

    

}

// 统计记录信息
async function recordStat(){

}

// 统计工作人员信息
async function doctorStat(){

}