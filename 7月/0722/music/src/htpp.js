import axios from 'axios'

const http = axios.create({
    baseURL:'https://api.qq.jsososo.com'
})
export default http;