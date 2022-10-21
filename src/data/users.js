const sql = require('mssql');
const axios = require('axios')

const utils = require('./utils');
const config = require('../../config');
const { URL } = require('../api');

const login = async (username, password) => {
    // console.log(username, password);
    try {
        const pool = await sql.connect(config.sql)
        const sqlQueries = await utils.loadSqlQueries('events')
        const event = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            .query(sqlQueries.userLogin)

        return event
    } catch (error) {
        console.error(error);
    }
}

const loginAPI = async (username, password, callback) => {
    try {
        axios({
            method:'POST',
            // url:'http://467a0269edbd.sn.mynetname.net:80/API/login',
            url:`${URL}/API/login`,
            // url:'http://localhost:3333/API/login',
            data: {
                username, password
            }
        }).then(response => {
            // console.log(response.data.status)
            return callback({status:'ok', data:response.data})
        }).catch(error => {
            // console.error(error.response.data)
            if (error.response.data.status == 400) {
                // username password tidak cocok
                return callback({status:'no', data:error.response.data})
            } else if (error.response.data.status == 404) {
                // user tidak ada
                return callback({status:'not found', data:error.response.data})
            }
        })
    } catch (error) {
        console.error(error);
    }
}

const resetAkunUser = (username, password, callback) => {
    try {
        axios({
            method:'POST',
            // url:'http://localhost:3333/API/resetakun',
            // url:'http://467a0269edbd.sn.mynetname.net:80/API/resetakun',
            url:`${URL}/API/resetakun`,
            data: {
                username, password
            }
        }).then(response => {
            return callback({ status: 'ok', data: response.data })
        }).catch(error => console.error('RESET AKUN ERROR', error))
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    login,
    loginAPI,
    resetAkunUser
}