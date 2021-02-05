// ASPECT评分相关接口

const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init({
    env: "cyr-8gbthlqn6c4254da"
})
// 初始化数据库
const db = cloud.database()
const _ = db.command
const aspectCollection = "aspects"

exports.main = async function (event) {

    const app = new TcbRouter({ event })

    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    app.router("getByVisitRecordId", async(ctx, next)=>{
        try {
            const res = await db.collection(aspectCollection).where({
                visitRecordId: event.visitRecordId
            }).get()
            // 存在返回
            if (res.data.length > 0) {
                ctx.body = {
                    code: 1,
                    data: res.data[0]
                }
            } else {
                // 不存在创建，返回id
                const addRes = await db.collection(aspectCollection).add({
                    visitRecordId: event.visitRecordId
                })
                ctx.body = {
                    code: 1,
                    data: {
                        _id: addRes.id,
                    }
                }
            }
        } catch (error) {
            console.error(error);
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    app.router("setResult", async(ctx, next)=>{
        try {
            await db.collection(aspectCollection).doc(event.id).update({
                startTime: event.startTime,
                endTime: event.endTime,
                totalScore: event.totalScore,
                score: event.score,
                result: event.result,
                doctorId: event.doctorId,
                doctorName: event.doctorName,
                state: false
            })
            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
            
        }
    })

    return app.serve()

};