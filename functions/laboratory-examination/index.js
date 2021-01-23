// 化验检查相关接口

const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init()
// 初始化数据库
const db = cloud.database()
const _ = db.command
const leCollection = "laboratory-examination"

exports.main = async function (event) {

    const app = new TcbRouter({ event })

    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    // 通过就诊记录获取
    app.router("getByVisitRecordId", async (ctx, next) => {
        try {
            const res = await db.collection(leCollection).where({
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
                const addRes = await db.collection(leCollection).add({
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
            console.log(error);
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }

    })

    // 更新照片信息
    app.router("setImages", async (ctx, next) => {
        try {
            await db.collection(leCollection).doc(event.id).update({
                images: event.images
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

    // 开始抽血
    app.router("startDrawBlood", async(ctx, next)=>{
        try {
            await db.collection(leCollection).doc(event.id).update({
                bloodTime: event.bloodTime,
                drawBloodDoctorId: event.drawBloodDoctorId,
                drawBloodDoctorName: event.drawBloodDoctorName
            })
            ctx.body = {
                code: 1,
                data: "SUNCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新到达时间
    app.router("setArriveTime", async(ctx, next)=>{
        try {
            await db.collection(leCollection).doc(event.id).update({
                arriveLaboratoryTime: event.arriveLaboratoryTime,
                examinationDoctorId: event.examinationDoctorId,
                examinationDoctorName: event.examinationDoctorName
            })
            ctx.body = {
                code: 1,
                data: "SUNCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新图片
    app.router("setImages", async(ctx, next)=>{
        try {
            await db.collection(leCollection).doc(event.id).update({
                images: event.images,
            })
            ctx.body = {
                code: 1,
                data: "SUNCCESS"
            }
        } catch (error) {
            console.error(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新完成时间
    app.router("setEndTime", async (ctx, next) => {
        try {
            await db.collection(leCollection).doc(event.id).update({
                endTime: event.endTime,
                state: true
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
