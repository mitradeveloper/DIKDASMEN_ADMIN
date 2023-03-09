'use strict';
const rupiah = require('rupiah-format');
// const crypto = require('crypto')

const data_aktivasi = require('../data/aktivasi');
const eventData = require('../data/aktivasi');
const { loginAPI, /* resetAkunUser */ } = require('../data/users');

//GET
const get_login = async (req, res) => {
    if (req.cookies.user) {
        // redirect halaman dashboard
        res.redirect('/')
    } else {
        res.render('./pages/login', {
            title: 'Login',
            layout: 'login_layout',
            // error alert untuk user dan password tidak cocok
            err400: req.flash('err400'),
            // error alert untuk user tidak ada
            err404: req.flash('err404'),
        });
    }
}

const logout = (req, res) => {
    // membersihkan cookie dan redirect halaman
    res.clearCookie('user', {path:'/'}).redirect('/login')
}

//POST
const post_login = async (req, res) => {
    const {username, password} = req.body

    await loginAPI(username, password, function (data) {
        // console.log(data.data.status)
        if (data.status == 'ok') {
            res.cookie('user', data.data.user)
                .status(201)
                .redirect('/')
        } else if (data.status == 'no') {
            req.flash('err400', 'Username dan Password yang diinputkan tidak cocok')
            res.status(400).redirect('/login')
        } else if (data.status == 'not found') {
            req.flash('err404','User tidak ada')
            res.status(404).redirect('/login')
        }
    })

    // if (result.recordset[0]) {
    //     if (result.recordset[0].username === username && result.recordset[0].password === password) {
    //         const token = jwt.sign({username: username}, process.env.SECRET_KEY || 'secrettest', {expiresIn: '1h'})

    //         res.cookie('user',crypto.createHmac('sha256',token)).status(201).redirect('/')
    //         req.session.cookie.expires = new Date(Date.now() + 1000)
    //     } else {
    //         // username dan password yang diinputkan tidak cocok
    //         req.flash('err400', 'Username dan Password yang diinputkan tidak cocok')
    //         res.status(400).redirect('/login')
    //     }
    // } else {
    //     // user tidak ada
    //     req.flash('err404','User tidak ada')
    //     res.status(404).redirect('/login')
    // }
}

// const getAkun = async (req, res) => {
//     try {
//         if (req.cookies.user) {
//             res.render('./pages/akun', {
//                 title: 'Akun',
//                 layout: 'main_layout',
//                 page: 'akun',
//                 succReset: req.flash('succReset')
//             })
//         } else {
//             res.redirect('/login')
//         }
//     } catch (error) {
//         console.error(error);
//     }
// }

// const resetAkun = async (req, res) => {
//     try {
//         const { username, password } = req.body

//         await resetAkunUser(username, password, function(data) {
//             // console.log(data)

//             if (data.status == 'ok') {
//                 req.flash('succReset', 'Reset Akun Sukses')
//                 res.redirect('/akun')
//             } 
//         })
//     } catch (error) {
//         console.error(error);
//     }
// }

const getBantuan = async (req, res) => {
    try {
        if (req.cookies.user) {
            res.render('./pages/bantuan', {
                title: 'Bantuan',
                layout: 'main_layout',
                page: 'bantuan',
            })
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        res.status(500).json({
            status:500,
            msg:error.message
        })
    }
}

//API
const post_aktivasi = async (req, res) => {
    try {
        var kodesekolah = req.header('kd_sekolah');
        var kodeaktivasi = req.header('kd_aktivasi');
        var kodereq = req.body.kd;
        const result = await data_aktivasi.submit(kodesekolah, kodeaktivasi, kodereq);
        return res.status(result.status).json(result.response);
    } catch (error) {
        console.log(error);
    }

}

const post_cektoken = async (req, res, next) => {
    try {
        var cektok = req.body.token;
        const event = await data_aktivasi.cekToken(cektok);
        res.send(event);
    } catch (error) {
        console.log(error);
    }
}

const post_laporan = async (req, res, next) => {
    try {
        const idsek = req.body.idsek;
        const namasekolah = req.body.namasekolah;
        const tanggal = req.body.timestamp;
        const filepdf = req.body.filepdf;
        const result = await data_aktivasi.addlaporan(idsek, namasekolah, tanggal, filepdf)
        if (result == undefined) {
            res.send({status:'ok'})
        } else {
            res.send({error})
        }
        // res.send(result)
        // return res.status({result})
    } catch (error) {
        console.log(error);
    }
}

const getDashboard = async (req, res) => {
    try {
        if (req.cookies.user) {
            await data_aktivasi.getListAll(function (dataAll) {
                data_aktivasi.getlistallperiod(function (dataPeriod) {
                    res.render('./pages/dashboard', {
                        title: 'Dashboard',
                        layout: 'main_layout',
                        page: 'dashboard',
                        totalSekolah: dataAll.row.length,
                        totalPeriod: dataPeriod.length
                    });
                })
            })
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.error(error);
    }
}

const getRegisterSekolah = async (req, res) => {
    res.render('./pages/register_sekolah', {
        title: 'Register Sekolah',
        layout: 'main_layout',
        page: 'register_sekolah'
    });
}

const getListSekolah = async (req, res, next) => {
    try {
        if (req.cookies.user) {
            await data_aktivasi.getListAll(function (data) {
                // console.log(data);
                let listdata = [];
                for (let i = 0; i < data.row.length; i++) {
                    // const dataPeriodResult = data_aktivasi.GetListPeriodBySekolah(data.row[i].namasekolah, function(dataPeriod) {
                        // console.log(dataPeriod)
                        // console.log(dataPeriod.length)
                        // return dataPeriod
                        // if (dataPeriod.length == 0) {
                        //     console.log('belum sinkron')
                        // } else {
                        //     console.log('sudah sinkron')
                        // }
                    // })

                    listdata.push({
                        id: data.row[i].id,
                        namasekolah: data.row[i].namasekolah,
                        kodesekolah: data.row[i].kodesekolah,
                        // kodeaktivasi: data.row[i].kodeaktivasi,
                        // token: data.row[i].token
                        // dataPeriodResult: dataPeriodResult.length
                    })
                }

                // console.log(listdata);
                res.render('./pages/list_sekolah', {
                title: 'List Sekolah',
                layout: 'main_layout',
                page: 'list_sekolah',
                data: listdata,
                no: 1,
                succ: req.flash('success'),
                updatesucc: req.flash('updatesucc'),
                exist: req.flash('dataexist'),
                del: req.flash(`del`)
                });
            })
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error);
    }
}

const getunsync = async (req, res, next) => {
    try {
        await data_aktivasi.getunsync(function(data) {
            let listdata = []
            for (let i = 0; i < data.data.length; i++) {
                listdata.push({
                    kodesekolah:data.data[i].kodeSekolah,
                    namaSekolah:data.data[i].NamaSekolah
                })                
            }
            // console.log(listdata);
            res.render('./pages/list_unsync', {
                title: 'List Sekolah sudah sinkron',
                layout: 'main_layout',
                page: 'list_sudah_sinkron',
                data:listdata,
                no: 1
            })
        })
    } catch (error) {
        console.log(error);
    }
}

const getListLaporan = async (req, res, next) => {
    res.render('./pages/listlaporan', {
        title: 'List Laporan',
        layout: 'main_layout',
        page: 'list_laporan'
    })
}

const inPenerimaan = async (req, res) => {
    res.render('./pages/inPenerimaan', {
        title: 'Input Penerimaan',
        layout: 'main_layout',
        page: 'inPenerimaan'
    });
}

const inPengeluaran = async (req, res) => {
    res.render('./pages/inPengeluaran', {
        title: 'Input Pengeluaran',
        layout: 'main_layout',
        page: 'inPengeluaran'
    });
}

const apiSekolah = async (req, res, next) => {
    // const namasekolah = req.body.nama;
    try {
        const events = await eventData.getListAll();
        res.send(events)
    } catch (error) {
        res.status(400).send(error.message)
    }
}

const apiSekolahID = async (req, res, next) => {
    const namasekolah = req.body.nama;
    try {
        const events = await eventData.getList(namasekolah);
        res.send(events)
    } catch (error) {
        res.status(400).send(error.message)
    }
}

// ADD SQL SERVER
const addlistsekolah = async (req, res, next) => {
    const id = req.body.inpIdSekolah
    const namasekolah = req.body.inpNamaSekolah
    const kodesekolah = req.body.inpKodeSekolah
    const kodeaktivasi = req.body.inpKodeAktivasi
    const token = ''
    // console.log(id);
    //query db berdasarkan body
    await eventData.cekSekolah(id, namasekolah, kodesekolah, kodeaktivasi, token, function(data) {
        // console.log(data.data.length);
        const cek = data.data.length;
        if (cek > 0) {
            // console.log('data sudah ada');
            req.flash(`dataexist`, `data sudah ada silahkan teliti kembali`)
            res.redirect('/list')
        } else {
            eventData.addSekolah(id, namasekolah, kodesekolah, kodeaktivasi)
            req.flash(`success`, `data ${namasekolah} berhasil dimasukkan`);
            res.redirect('/list')
        }
    })
    //kodisi jika ada kembalikan fungsi jika tidak masukkan data
}

// ADD POST API
const addlistsekolahAPI = async (req, res) => {
    const {id, namasekolah, kodesekolah, kodeaktivasi, token} = req.body;
    
    // await call function addSekolahAPI dari aktivasi.js
    await data_aktivasi.addSekolahAPI(id, namasekolah, kodesekolah, kodeaktivasi, token, function(data) {
        // console.log(data)
        if (data.status == "ok") {
            // console.log('data sudah ada');
            req.flash(`success`, `data ${namasekolah} berhasil dimasukkan`);
            res.redirect('/list')
        } else {
            req.flash(`dataexist`, `data sudah ada silahkan teliti kembali`)
            res.redirect('/list')
        }
    })
}

const getEditsekolah = async (req,res,next) => {
    const id = req.query.id
    await data_aktivasi.getUpdateSekolah(id, function(data) {
        // console.log(data.row[0].Id);
        res.render('./pages/geteditsekolah', {
            title: 'List Laporan',
            layout: 'main_layout',
            page: 'list_laporan',
            data: data.row[0]
        })
    })
}

const editsekolah = async (req, res, next) => {
    try {
        const idsek = req.query.id
        const namasekolah = req.body.inpNamasekolah
        const kodeaktivasi = req.body.inpKodeaktivasi
        // console.log(idsek);
        await data_aktivasi.updatesekolah(idsek, namasekolah, kodeaktivasi, function(data) {
            if (data.status == 'ok') {
                req.flash('updatesucc', `${data.msg}`)
                res.redirect(`/list`)
            }
        })

    } catch (error) {
        res.send({status:'ok', msg:`gagal mengganti data`})
    }
    next()
}

// HIT API SAKUMU PUT
const editsekolahAPI = async (req, res) => {
    const {id} = req.params
    const {namasekolah, kodesekolah, kodeaktivasi, token} = req.body

    // await call function updateSekolahAPI dari aktivasi.js
    await data_aktivasi.updatesekolahAPI(id, namasekolah, kodesekolah, kodeaktivasi, token, function(data) {
        // console.log(data)
        if (data.status == "ok") {
            req.flash('updatesucc', `data ${namasekolah} berhasil diupdate`)
            res.redirect(`/list`)
        } else {
            req.flash(`dataexist`, `data sudah ada silahkan teliti kembali`)
            res.redirect('/list')
        }
    })
}

const getLaporankas = async (req, res, next) => {
    try {
        const kodesekolah = atob(req.query.kodesekolah)
        await data_aktivasi.getLaporan(kodesekolah, function(data) {
            // console.log(data);
            if (data.status === 'ok') {
                const terima = data.data.penerimaan
                console.log(terima);
                const listpenerimaan = [];
                let totalIn = 0;
                for (let i = 0; i < terima.length; i++) {
                    listpenerimaan.push({
                        sub: terima[i].sub,
                        dess: terima[i].dess,
                        total: terima[i].total,
                        totalRp: terima[i].totalRp
                    })
                    totalIn += terima[i].total
                }
                // console.log(rupiah.convert(totalIn));
                const keluar = data.data.pengeluaran
                const listpengeluaran = [];
                let totalOut = 0;
                for (let i = 0; i < keluar.length; i++) {
                    listpengeluaran.push({
                        sub: keluar[i].sub,
                        dess: keluar[i].dess,
                        total: keluar[i].total,
                        totalRp: keluar[i].totalRp
                    })
                    totalOut += keluar[i].total
                }
                // console.log(listpengeluaran);
                // console.log(rupiah.convert(totalOut));
                const totalAll = totalIn - totalOut
                // console.log(totalAll);
                res.render(`./pages/laporankas`,{
                    title: `laporankas`,
                    layout: `main_layout`,
                    page: `laporankas`,
                    penerimaan: listpenerimaan,
                    pengeluaran: listpengeluaran,
                    total_penerimaan: rupiah.convert(totalIn),
                    total_pengeluaran: rupiah.convert(totalOut),
                    totalAll: rupiah.convert(totalAll)
                })
            }
        });
    } catch (error) {
        console.log(error);
    }
}

const getDelete = async (req, res, next) => {
    try {
        const id = req.query.id
        await data_aktivasi.delSekolahAPI(id)
        req.flash(`del`, `data telah terhapus`)
        res.redirect(`/list`)
    } catch (error) {
        console.log(error);
    }
}

// menu list period
const getlistperiod = async (req, res, next) => {
    try {
        if (req.cookies.user) {
            await data_aktivasi.getlistallperiod(function(data) {
                res.render('./pages/list_period', {
                    title: 'List Period',
                    layout: 'main_layout',
                    page: 'list_periode',
                    data: data,
                    no: 1
                })
            })
        } else {
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error);
    }
}

const getlistsekolahbyperiod = async(req, res, next) => {
    if (req.cookies.user) {
        const periode = atob(req.query.periode)
        await data_aktivasi.getsekolahbyperiod(periode, function(data) {
            try {
                res.render('./pages/list_sekolah_by_period',{
                    title: 'List Sekolah By Period',
                    layout: 'main_layout',
                    page: 'list_sekolah_by_period',
                    data:data,
                    no: 1
                })
            } catch (error) {
                console.log(error);
            }
        })
    } else {
        res.redirect('/login')
    }
}

const getperiodesinkron = async(req, res, next) => {
    const appsekolah = atob(req.query.appsekolah)
    const periode = atob(req.query.periode)
    // console.log(periode);
    await data_aktivasi.GetDetailSinkronPeriod(appsekolah, periode, function(data) {
        // console.log(data);
        const terima = data.penerimaan
        const listpenerimaan = [];
        let totalIn = 0
        for (let i = 0; i < terima.length; i++) {
            listpenerimaan.push({
                sub: terima[i].sub,
                dess: terima[i].dess,
                total: terima[i].total,
                totalRp: terima[i].totalRp
            })
            totalIn += terima[i].total
        }
        const keluar = data.pengeluaran
        const listpengeluaran = [];
        let totalout = 0
        for (let i = 0; i < keluar.length; i++) {
            listpengeluaran.push({
                sub: keluar[i].sub,
                dess: keluar[i].dess,
                total: keluar[i].total,
                totalRp: keluar[i].totalRp
            })
            totalout += keluar[i].total
        }
        // console.log(totalout);
        const totalAll = totalIn - totalout
        try {
            const date1 = periode.substring(6,8)
            const month1 = periode.substring(4,6)
            const year1 = periode.substring(0,4)
            const date2 = periode.substring(15,17)
            const month2 = periode.substring(13,15)
            const year2 = periode.substring(9,13)
            const swappedPeriod1 = `${date1}/${month1}/${year1}`
            const swappedPeriod2 = `${date2}/${month2}/${year2}`
            res.render('./pages/detail_sinkron_period', {
                title: 'Detail periode sinkron',
                layout: 'main_layout',
                page: 'detail_sinkron_period',
                penerimaan: data.penerimaan,
                pengeluaran: data.pengeluaran,
                total_penerimaan: rupiah.convert(totalIn),
                total_pengeluaran: rupiah.convert(totalout),
                totalAll:rupiah.convert(totalAll),
                appsekolah,
                periode: `${swappedPeriod1} - ${swappedPeriod2}`
            })
        } catch (error) {
            console.log(error);
        }
    })
}

const getperiodbysekolah = async(req, res, next) => {
    if (req.cookies.user) {
        // const namasekolah = req.query.namasekolah
        const appsekolah = atob(req.query.appsekolah)
        await data_aktivasi.GetListPeriodBySekolah(appsekolah, function(data) {
            // console.log(data)
            // console.log(data.length)
            try {
                res.render(`./pages/list_period_by_sekolah`, {
                    title: `List periode sekolah`,
                    layout: 'main_layout',
                    page: 'list_periode_sinkron',
                    data: data,
                    // namasekolah,
                    appsekolah,
                    no: 1
                })
            } catch (error) {
                console.log(error);
            }
        })
    } else {
        res.redirect('/login')
    }
}

const delperiodbysekolah = async(req, res, next) =>{
    const appsekolah = atob(req.query.appsekolah);
    const periode = atob(req.query.periode)
    await data_aktivasi.GetDeletePeriodSekolah(appsekolah, periode, function(data) {
        console.log(data.data.msg);
        if (data.data.status == 200) {
            req.flash(`respons`, data.data.msg);
            res.redirect(`listperiod`)
        } else {
            
        }
    })
}
module.exports = {
    get_login,
    logout,
    post_login,
    // getAkun,
    // resetAkun,
    getBantuan,
    post_aktivasi,
    getDashboard,
    getRegisterSekolah,
    getListSekolah,
    inPenerimaan,
    inPengeluaran,
    apiSekolah,
    apiSekolahID,
    post_cektoken,
    addlistsekolah,
    addlistsekolahAPI,
    getListLaporan,
    post_laporan,
    getLaporankas,
    editsekolah,
    editsekolahAPI,
    getEditsekolah,
    getDelete,
    getunsync,
    getlistperiod,
    getlistsekolahbyperiod,
    getperiodesinkron,
    getperiodbysekolah,
    delperiodbysekolah
}