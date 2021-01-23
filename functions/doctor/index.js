// 医护人员
const tcb = require("@cloudbase/node-sdk")
const TcbRouter = require("tcb-router")


// 初始化云环境，使用默认云环境
const cloud = tcb.init()
// 初始化数据库
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

// 医护人员 集合名
const doctorCollection = "doctors"


exports.main = async function (event) {

    const app = new TcbRouter({ event })

    // 全局中间件  做权限管理
    app.use(async (ctx, next) => {
        ctx.data = {}
        await next()
    })

    // 登录
    app.router("login", async (ctx, next) => {
        try {
            // 登录逻辑
            const res = await db.collection(doctorCollection).where({
                device: event.device
            }).get()
            if (res.data.length == 0) {
                ctx.body = {
                    code: 0,
                    data: "用户不存在"
                }
            } else {
                var doctor = res.data[0]
                ctx.body = {
                    code: 1,
                    data: doctor
                }
            }
        } catch (e) {
            console.log(e)
            ctx.body = {
                code: 0,
                data: "数据库异常"
            }
        }
    })

    // 更改状态
    app.router("changeWorkState", async (ctx, next) => {
        try {
            await db.collection(doctorCollection).where({
                idCard: event.idCard
            }).update({
                state: event.state
            })
            ctx.body = {
                code: 1,
                data: event.state
            }
        } catch (e) {
            console.log(e)
            ctx.body = {
                code: 0,
                data: "数据库异常"
            }
        }
    })

    // 分科室获取所有医护人员信息
    app.router("getAllDoctors", async (ctx, next) => {
        try {
            const res = await db.collection(doctorCollection)
                .aggregate()
                .bucket({
                    groupBy: '$department',
                    boundaries: ["影像科", "急救中心", "急诊科", "检验科", "神经内科"],
                    default: '神经内科',
                    output: {
                        count: $.sum(1),
                        list: $.push({
                            _id: "$_id",
                            name: "$name",
                            job: "$job",
                            state: "$state",
                            gender: "$gender",
                            age: "$age",
                        })
                    }
                }).end()

            ctx.body = {
                data: res.data,
                code: 1
            }
        } catch (error) {
            console.log(error)
            ctx.body = {
                code: 0,
                data: "数据库异常"
            }
        }

    })

    // 通过ID搜索
    app.router("searchById", async(ctx, next)=>{
        try {
            const res = await db.collection(doctorCollection).where({
                _id: event.id
            }).get()
            ctx.body = {
                code: 1,
                data: res.data.length>0?res.data[0]:"不存在"
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
