import axios from 'axios';
import { ElMessage } from 'element-plus'
import router from '../src/router/index'

// 请求拦截器
axios.interceptors.request.use(config=> {
    // 如果存在token 请求就携带
    const token = localStorage.getItem('token')
    if (config.url != 'http://upload-z1.qiniup.com') {
        if (token != null && token != 'undefined' && token != '') {
            config.headers['token'] = token;
        }
    }
    return config;
}, error=> {
    console.log(error)
})

// 响应拦截器
axios.interceptors.response.use(success=>{
    if (success.data) {
        let data = success.data;
        console.log('response  data  ', data)
        data = (typeof data) == 'string' ? JSON.parse(data) : data;
        if (data.code == 10001 || data.code == 10002) {
          localStorage.removeItem("token")
        }
      }
    if (success.headers.newtoken) {
    localStorage.setItem("token", success.headers.newtoken);
    }
    // 业务逻辑错误
    if (success.status && success.status==200) {
        if (success.data.status == 0) {
            ElMessage.error({message:success.data.msg});
            return;
        }
        if (success.data.msg) {
            ElMessage.success({message:success.data.msg});
        }
    }
    return success.data;
}, error => {
    if (error) {
        if (error.response.code == 504 || error.response.code == 404) {
            ElMessage.error({message:"页面找不到了，试试换一个地址吧"});
        } else if (error.response.code == 403){
            ElMessage.error({message:"权限不足，请联系管理员"});
        } else if (error.response.code == 401){
            ElMessage.error({message:"尚未登陆，请登录"});
            router.replace('/login')
        } else {
            if (error.response.data.message) {
                ElMessage.error({message:error.response.data.msg});
            } else {
                ElMessage.error({message:"未知错误"});
            }
        }
        ElMessage.error({message:"未知错误" + error});
    } else {
        ElMessage.error({message:"未知错误"});
    }
    return;
})

const baseUrl = '/after';

// 传送json格式的post请求
export const req = {
    post: (url, body)=> {
        return axios({
            method: 'post',
            url: `${baseUrl}${url}`,
            data: body
        })
    },
    get: (url, params)=> {
        return axios({
            method: 'get',
            url: `${baseUrl}${url}`,
            params: params
        })
    },
    delete: (url, body)=> {
        return axios({
            method: 'delete',
            url: `${baseUrl}${url}`,
            data: body
        })
    },
    put: (url, body)=> {
        return axios({
            method: 'put',
            url: `${baseUrl}${url}`,
            data: body
        })
    },
    qiniu: function(form) {
        return axios({
          method: 'post',
            url: 'http://upload-z1.qiniup.com',
            processData: false,
            contentType: false,
            data: form,
        })
    },
    dateFormat: function(fmt, date) {
        let ret;
        const opt = {
            "Y+": date.getFullYear().toString(),        // 年
            "m+": (date.getMonth() + 1).toString(),     // 月
            "d+": date.getDate().toString(),            // 日
            "H+": date.getHours().toString(),           // 时
            "M+": date.getMinutes().toString(),         // 分
            "S+": date.getSeconds().toString()          // 秒
            // 有其他格式化字符需求可以继续添加，必须转化成字符串
        };
        for (let k in opt) {
            ret = new RegExp("(" + k + ")").exec(fmt);
            if (ret) {
                fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
            };
        };
        return fmt;
    }
}

export const getCurrentDate = function(nowDate) {
    var year = nowDate.getFullYear();
    var month =
      nowDate.getMonth() + 1 < 10
        ? "0" + (nowDate.getMonth() + 1)
        : nowDate.getMonth() + 1;
    var day =
      nowDate.getDate() < 10 ? "0" + nowDate.getDate() : nowDate.getDate();
    var dateStr = year + "-" + month + "-" + day;
    return dateStr;
}