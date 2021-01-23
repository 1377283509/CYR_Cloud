// 消息
const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")

// 初始化云环境，使用默认云环境
const cloud = tcb.init();
// 初始化数据库
const db = cloud.database()
const _ = db.command

// 消息集合名
const messageCollection = "message"
const doctorCollection = "doctors"


exports.main = async function (event) {

    const app = new TcbRouter({ event })
    // 全局中间件  做权限管理
    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    // 设置已读
    app.router("setRead", async (ctx, next) => {
        try {
            const res = await db.collection(messageCollection).doc(event.id).update({
                state: true
            })
            ctx.body = {
                code: 1,
                data: res
            }
        } catch (error) {
            console.log(error);
            ctx.body = {
                code: 0,
                data: "数据库异常"
            }

        }
    })

    // 获取所有消息
    app.router("getAll", async (ctx, next) => {
        try {
            const res = await db.collection(messageCollection).where({
                to: event.doctor
            }).orderBy("state", "asc").get()
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

    // 发送新患者消息
    app.router("sendNewPatientMessage",
        // 发送消息
        async (ctx, next) => {
            try {
                const doctors = await db.collection(doctorCollection).where({
                    state: true,
                }).field({
                    _id: true
                }).get()

                doctors.data.forEach(async(e)=>{
                    await db.collection(messageCollection).add({
                        state: false,
                        sendTime: event.sendTime,
                        to: e._id,
                        patientName: event.patientName,
                        visitRecord: event.visitRecord,
                        content: event.content
                    })
                })
            } catch (error) {
                console.error(error)
                ctx.body = {
                    code: 0,
                    data: error
                }

            }
        })


    return app.serve()
};
