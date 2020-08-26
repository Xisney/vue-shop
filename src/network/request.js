// 分装独立的网络请求
import axios from 'axios';

export default function(config){
    const instance = axios.create({
        baseURL:'http://127.0.0.1:8888/api/private/v1/',
        timeout:5000
    });
    
    // 设置拦截器
    instance.interceptors.request.use(config=>{
        return config;
    },err=>{
        console.log(err);
    })

    instance.interceptors.response.use(res=>{
        return res.data;
    },err=>{
        console.log(err);
    });
    
    // 返回一个promise对象
    return instance(config);
}
