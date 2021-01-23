// 统计相关接口
const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init()
// 初始化数据库
const db = cloud.database()
const _ = db.command

const monthStatisticCollection = "monthly-statistics"
const ctStatisticCollection = "ctStatistic"
const ecgStatisticCollection = "ecgStatistic"
const leStatisticCollection = "laboratoryExaminationStatics"
const secondlineStatisticCollection = "secondlineDoctorStatistic"
const vitalSignsStatisticCollection = "vitalSignsStatistic"
const nihssStatisticCollection = "nihssStatistic"
const mrsStatisticCollection = "mrsStatistic"
const evtStaticticCollection = "evtStatistic"
const ivctStaticticCollection = "ivctStatistic"

const ctCollection = "ct"
const ecgCollection = "ecg"
const evtCollection = "evt"
const ivctCollection = "ivct"
const leCollection = "laboratory-examination"
const mRSCollection = "mrs"
const NIHSSCollection = "nihss"
const secondDoctorCollection = "secondline-doctor"
const vitalSignsCollection = "vital-signs"


exports.main = async function (event) {
    const app = new TcbRouter({ event })

    // 获取近12个月的患者统计信息
    app.router("getYearPatientData", async (ctx, next) => {
        try {
            const res = await db.collection(monthStatisticCollection).limit(12).get()
            ctx.body = {
                code: 1,
                data: res.data
            }
        } catch (e) {
            console.error(e)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 获取最近一个月的流程统计数据
    app.router("getRecentMonthFlowData", async (ctx, next) => {
        try {
            // 获取CT统计信息
            const ct = await getRecentMonthData(ctStatisticCollection)
            // 获取心电图统计信息
            const ecg = await getRecentMonthData(ecgStatisticCollection)
            // 获取化验统计信息
            const le = await getRecentMonthData(leStatisticCollection)
            // 二线统计信息
            const secondline = await getRecentMonthData(secondlineStatisticCollection)
            // 生命体征信息
            const vitalSigns = await getRecentMonthData(vitalSignsStatisticCollection)
            // NIHSS
            const nihss = await getRecentMonthData(nihssStatisticCollection)
            // mRS
            const mRS = await getRecentMonthData(mrsStatisticCollection)
            // ivct
            const ivct = await getRecentMonthData(ivctStaticticCollection)
            // evt
            const evt = await getRecentMonthData(evtStaticticCollection)

            // DNT
            const dnt = await getRecentMonthData(monthStatisticCollection)

            ctx.body = {
                code: 1,
                data: {
                    ct: ct.data[0],
                    ecg: ecg.data[0],
                    laboratoryExamination: le.data[0],
                    secondLine: secondline.data[0],
                    vitalSigns: vitalSigns.data[0],
                    nihss: nihss.data[0],
                    mRS: mRS.data[0],
                    ivct: ivct.data[0],
                    evt: evt.data[0],
                    dnt: dnt.data[0]
                }
            }

        } catch (error) {
            console.error(error)
            ctx.body = {
                data: "云函数异常",
                code: 0
            }
        }

    })

    // 获取流程详细数据
    app.router("getFlowDetailsData", async (ctx, next) => {
        var collectionName;
        switch (event.type) {
            case 0:
                collectionName = ctStatisticCollection
                break
            case 1:
                collectionName = ecgStatisticCollection
                break
            case 2:
                collectionName = leStatisticCollection
                break
            case 3:
                collectionName = secondlineStatisticCollection
            case 4:
                collectionName = vitalSignsStatisticCollection
                break
            case 5:
                collectionName = nihssStatisticCollection
                break
            case 6:
                collectionName = mrsStatisticCollection
                break
            case 7:
                collectionName = ivctStaticticCollection
                break
            case 8:
                collectionName = evtStaticticCollection
                break
            default:
                collectionName = undefined
        }
        if (collectionName) {
            try {
                const res = await getFlowDetailsData(collectionName)
                ctx.body = {
                    code: 1,
                    data: res.data
                }
            } catch (error) {
                ctx.body = {
                    code: 0,
                    data: "云函数异常"
                }
            }
        } else {
            ctx.body = {
                code: 0,
                data: "参数错误"
            }
        }
    })

    // 获取超时列表
    app.router("getOverTimeList", async(ctx, next)=>{
        var collectionName;
        var statisticCollectionName;
        switch (event.type) {
            case 0:
                collectionName = ctCollection
                statisticCollectionName = ctStatisticCollection
                break
            case 1:
                collectionName = ecgCollection
                statisticCollectionName = ecgStatisticCollection
                break
            case 2:
                collectionName = leCollection
                statisticCollectionName = leStatisticCollection
                break
            case 3:
                collectionName = secondDoctorCollection
                statisticCollectionName = secondlineStatisticCollection
                break
            case 4:
                collectionName = vitalSignsCollection
                statisticCollectionName = vitalSignsStatisticCollection;
                break
            case 5:
                collectionName = NIHSSCollection
                statisticCollectionName = nihssStatisticCollection
                break
            case 6:
                collectionName = mRSCollection
                statisticCollectionName = mrsStatisticCollection
                break
            case 7:
                collectionName = ivctCollection
                statisticCollectionName = ivctStaticticCollection
                break
            case 8:
                collectionName = evtCollection
                statisticCollectionName = evtStaticticCollection
                break
            default:
                collectionName = undefined
                statisticCollectionName = undefined
        }
        if(collectionName){
            // 加载超时列表
            try {
                const idList = await db.collection(statisticCollectionName).where({
                    _id: event.id
                }).field({
                    overTimeList: true
                }).get()
                
                const res  = await getOvertimeList(collectionName, idList.data[0].overTimeList);
                ctx.body = {
                    code: 1,
                    data: res.data,
                }
            } catch (error) {
                console.error(error)
                ctx.body = {
                    code: 0,
                    data: error
                }
            }
        }else{
            ctx.body = {
                code: 0,
                data: "参数错误"
            }
        }
    })

    return app.serve()
};


// 获取最近一个月数据
async function getRecentMonthData(collectionName) {
    return await db.collection(collectionName).orderBy("year",  "desc").orderBy("month", "desc").limit(1).field({
        overTimeList: false
    }).get()
}

// 获取流程详情
async function getFlowDetailsData(collectionName) {
    return await db.collection(collectionName).orderBy("year",  "desc").orderBy("month", "desc").limit(12).field({
        overTimeList: false
    }).get()
}

// 获取超时数据
async function getOvertimeList(collectionName, idList) {
    return await db.collection(collectionName).where({
        _id: _.in(idList)
    }).get()
}