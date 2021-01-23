const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init()
// 初始化数据库
const db = cloud.database()
const _ = db.command

// 就诊记录集合名
const visitRecordsCollection = "visit-records"
const patientsCollection = "patients"
const doctorsCollection = "doctors"
const recordCollection = "records"

exports.main = async function (event) {

    const app = new TcbRouter({ event })

    // 全局中间件  做权限管理
    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    // 创建记录
    app.router("createRecord", async(ctx, next)=>{
        try {
            await db.collection(recordCollection).add(event.data)
            ctx.body = {
                code: 1,
                data: "OK"
            }
        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "数据库异常"
            }
        }

    })

    // 获取患者的所有记录 
    app.router("getAllRecordsById",async(ctx, next)=>{
        try {
            const res = await db.collection(recordCollection).aggregate().match({
                visitRecord: event.id
            }).project({
                _id: true,
                name: true,
                startTime: true,
                endTime:true,
                content: true,
                images: true,
                patient: true,
                state: true,
                remarks: true,
                doctorName: true,
                doctorId: true,
            }).sort({
                startTime:1
            }).end()
            ctx.body = {
                code: 1,
                data: res.data
            }
        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "数据库异常"
            }
        }

    })

    // 通过ID获取详情
    app.router("getDetailById", async(ctx, next)=>{
        try {
            const res = await db.collection(recordCollection).where({
                _id: event.id
            }).get()

            ctx.body = {
                code: 1,
                data: res.data[0]
            }
            
        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "数据库异常"
            }
        }
    })

    return app.serve()

};
