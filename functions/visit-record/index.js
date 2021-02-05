// 就诊记录
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
const visitRecordsCollection = "visit-records"
// 患者集合
const patientsCollection = "patients"

// 静脉溶栓集合
const ivctCollection = "ivct"
// 血管内治疗集合
const evtCollection = "evt"
// CT集合
const ctCollection = "ct"
const referDurationCollection = "refer-duration"

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

    // 获取所有完成就诊的患者
    app.router("getAllFinishedRecords", async(ctx, next)=>{
        try {
            const res = await db.collection(visitRecordsCollection).aggregate().match({
                state: true
            }).lookup({
                localField: "patient",
                foreignField: "_id",
                from: patientsCollection,
                as: "patient"
            }).project({
                _id: true,
                visitTime: true,
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
                arriveTime:true,
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
                    arriveTime: true,
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

    // 绑定手环,设置到院时间
    app.router("bindBangle",
        async (ctx, next) => {
            try {
                await db.collection(visitRecordsCollection).doc(event.id).update({
                    bangle: event.bangle,
                    arriveTime: event.arriveTime
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
                doctorName: event.doctorName,
                visitTime: event.visitTime
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


    // 获取时间节点信息
    app.router("getTimePointData", async(ctx, next)=>{
        try {
            data = {

            }
            // 就诊时间
            // 到院时间
            // 发病时间
            const visitRecordInfo = await db.collection(visitRecordsCollection).where({
                _id: event.id,
            }).field({
                visitTime: true,
                arriveTime: true,
                diseaseTime: true
            }).get()
            if(visitRecordInfo.data.length != 0){
                data.visitTime = visitRecordInfo.data[0].visitTime
                data.arriveTime = visitRecordInfo.data[0].arriveTime
                data.diseaseTime = visitRecordInfo.data[0].diseaseTime
            }
            // CT完成时间
            const ctInfo = await db.collection(ctCollection).where({
                visitRecordId: event.id
            }).field({
                endTime: true
            }).get()
            if(ctInfo.data.length != 0){
                data.ctFinishedTime = ctInfo.data[0].endTime
            }
            // 血管内治疗开始知情时间
            // 血管内治疗知情结束时间
            // 穿刺时间
            // 再通时间
            // 造影完成时间
            const evtInfo = await db.collection(evtCollection).where({
                visitRecordId: event.id
            }).field({
                startWitting: true,
                endWitting: true,
                punctureTime: true,
                radiographyTime: true,
                revascularizationTime: true,
            }).get()
            if(evtInfo.data.length != 0){
                data.evtStartWitting = evtInfo.data[0].startWitting
                data.evtEndWitting = evtInfo.data[0].endWitting
                data.punctureTime = evtInfo.data[0].punctureTime
                data.radiographyTime = evtInfo.data[0].radiographyTime
                data.revascularizationTime = evtInfo.data[0].revascularizationTime
            }
            // 溶栓开始时间
            // 溶栓开始知情时间
            // 溶栓签署知情时间
            const ivctInfo = await db.collection(ivctCollection).where({
                visitRecordId: event.id
            }).field({
                startWitting: true,
                startTime: true,
                endWitting: true
            }).get()
            if(ivctInfo.data.length != 0){
                data.ivctStartWitting = ivctInfo.data[0].startWitting
                data.ivctEndWitting = ivctInfo.data[0].endWitting
                data.ivctStartTime = ivctInfo.data[0].startTime
            }

            // 获取参考时长
            const referDuration = await db.collection(referDurationCollection).limit(1).get()
            if(referDuration.data.length != 0){
                data.dnt = referDuration.data[0].dnt
                data.ont = referDuration.data[0].ont
                data.dpt = referDuration.data[0].dpt
                data.drt = referDuration.data[0].drt
                data.odt = referDuration.data[0].odt
            }
            ctx.body = {
                code: 1,
                data: data
            }
        } catch (error) {
            console.log('====================================');
            console.log(error);
            console.log('====================================');
            ctx.body = {
                code: 0,
                data: "云函数异常"
            }   
        }
    })


    return app.serve()

};
