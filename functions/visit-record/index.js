// 就诊记录
const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init()
// 初始化数据库
const db = cloud.database()
const _ = db.command

// 就诊记录集合
const visitRecordsCollection = "visit-records"
// 患者集合
const patientsCollection = "patients"

exports.main = async function (event) {

    const app = new TcbRouter({ event })

    // 全局中间件  做权限管理
    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    // 获取所有正在就诊的患者数据
    app.router("getAllRecords", async (ctx, next) => {
        try {
            const res = await db.collection(visitRecordsCollection).aggregate().match({
                state: false
            }).lookup({
                localField: "patient",
                foreignField: "_id",
                from: patientsCollection,
                as: "patient"
            }).project({
                _id: true,
                wardAddress: true,
                visitTime: true,
                diseaseTime: true,
                isWeekUpStroke: true,
                doctorId: true,
                doctorName: true,
                "patient.name": true,
                "patient.age": true,
                "patient.phone": true,
                "patient.gender": true,
                "patient.idCard": true,
                "doctor.name": true,
                "doctor.idCard": true
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

    // 创建就诊记录
    app.router("createVisitRecord", async (ctx, next) => {
        try {
            const res = await db.collection(visitRecordsCollection).add({
                patient: event.patient,
                doctor: event.doctor,
                pastHistory: event.pastHistory,
                isWeekUpStroke: event.isWeekUpStroke,
                chiefComplaint: event.chiefComplaint,
                state: false,
                createTime: db.serverDate(),
                wayToHospital: event.wayToHospital,
                diseaseTime: event.diseaseTime,
                bangle: event.bangle
            })
            ctx.body = {
                code: 1,
                data: res.id
            }

        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "数据库异常"
            }
        }
    })


    // 根据ID获取详细信息
    app.router("getVisitRecordDetail", async (ctx, next) => {
        try {
            const res = await db.collection(visitRecordsCollection).aggregate().match({
                _id: event.id,
            }).lookup({
                localField: "patient",
                foreignField: "_id",
                from: patientsCollection,
                as: "patient"
            }).project({
                _id: true,
                visitTime: true,
                pastHistory: true,
                chiefComplaint: true,
                result: true,
                isTIA: true,
                diseaseTime: true,
                isWeekUpStroke: true,
                lastStep: true,
                isIVCT: true,
                isEVT: true,
                bangle: true,
                doctorId: true,
                doctorName: true,
                "patient.name": true,
                "patient.age": true,
                "patient.gender": true,
                "patient.idCard": true,
            }).end()

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

    // 通过手环搜索
    app.router("getByBangle",
        async (ctx, next) => {
            try {
                const res = await db.collection(visitRecordsCollection).aggregate().match({
                    state: false,
                    bangle: event.bangle
                }).lookup({
                    localField: "patient",
                    foreignField: "_id",
                    from: patientsCollection,
                    as: "patient"
                }).project({
                    _id: true,
                    visitTime: true,
                    pastHistory: true,
                    chiefComplaint: true,
                    result: true,
                    isTIA: true,
                    diseaseTime: true,
                    isWeekUpStroke: true,
                    lastStep: true,
                    isIVCT: true,
                    isEVT: true,
                    bangle: true,
                    doctorId: true,
                    doctorName: true,
                    "patient.name": true,
                    "patient.age": true,
                    "patient.gender": true,
                    "patient.idCard": true,
                }).end()
                if (res.data.length != 0) {
                    ctx.body = {
                        code: 1,
                        data: res.data[0]
                    }
                } else {
                    ctx.body = {
                        code: 0,
                        data: "该手环未绑定患者"
                    }
                }
            } catch (error) {
                console.log(error)
                ctx.body = {
                    code: 0,
                    data: "数据库异常"
                }
            }
        })

    // 绑定手环,设置就诊时间
    app.router("bindBangle",
        async (ctx, next) => {
            try {
                await db.collection(visitRecordsCollection).doc(event.id).update({
                    bangle: event.bangle,
                    visitTime: event.visitTime
                })
                ctx.body = {
                    code: 1,
                    data: "SUCCESS"
                }

            } catch (error) {
                console.log(error)
                ctx.body = {
                    code: 0,
                    data: "数据库异常"
                }
            }
        })

    // 绑定病房
    app.router("bindWardAddress", async (ctx, next) => {

        try {
            const res = await db.collection(visitRecordsCollection).doc(event.id).update({
                wardAddress: event.address
            })

            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }
        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "数据库异常"
            }
        }

    })

    // 就诊时间
    app.router("setVisitTime",
        // 是否有记录
        async (ctx, next) => {
            try {
                const res = await db.collection(visitRecordsCollection).doc(event.id).field({
                    visitTime: true
                }).get()
                if (res.data[0].visitTime) {
                    ctx.body = {
                        code: 0,
                        data: "已绑定就诊时间，不可重复绑定"
                    }
                } else {
                    await next()
                }
            } catch (error) {
                ctx.body = {
                    code: 0,
                    data: "数据库异常"
                }
            }

        }, async (ctx, next) => {
            try {
                const res = await db.collection(visitRecordsCollection).doc(event.id).update({
                    visitTime: event.time
                })

                ctx.body = {
                    code: 1,
                    data: "SUCCESS"
                }
            } catch (error) {
                console.log(error)
                ctx.body = {
                    code: 0,
                    data: "数据库异常"
                }
            }
    })

    // 更新诊断结果
    app.router("updateVisitResult",
        async (ctx, next) => {
            try {
                await db.collection(visitRecordsCollection).doc(event.id).update({

                    result: event.result,

                })
                ctx.body = {
                    code: 1,
                    data: "SUCCESS"
                }

            } catch (error) {
                console.log(error)
                ctx.body = {
                    code: 0,
                    data: "数据库异常"
                }

            }

    })

    // 绑定主治医生
    app.router("setDoctor", async (ctx, next) => {
        try {
            await db.collection(visitRecordsCollection).doc(event.id).update({
                doctorId: event.doctorId,
                doctorName: event.doctorName
            })
            ctx.body = {
                code: 1,
                data: 'SUCCESS',
            }

        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新TIA
    app.router("setTIA", async (ctx, next) => {
        try {
            await db.collection(visitRecordsCollection).doc(event.id).update({
                isTIA: event.TIA,
            })

            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }

        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新IVCT
    app.router("setIVCT", async (ctx, next) => {
        try {
            await db.collection(visitRecordsCollection).doc(event.id).update({
                isIVCT: event.isIVCT,
            })

            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }

        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新EVT
    app.router("setEVT", async (ctx, next) => {
        try {
            await db.collection(visitRecordsCollection).doc(event.id).update({
                isEVT: event.isEVT,
            })

            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }

        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })

    // 更新去向
    app.router("setLastStep", async (ctx, next) => {
        try {
            await db.collection(visitRecordsCollection).doc(event.id).update({
                lastStep: event.lastStep,
                state: true,
                endTime: event.endTime
            })

            ctx.body = {
                code: 1,
                data: "SUCCESS"
            }

        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }
        }
    })


    return app.serve()

};
