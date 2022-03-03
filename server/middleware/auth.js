const { User } = require('../models/User')
let auth = (req, res, next) => {
  // < 인증 처리를 하는 곳 >

  // 1. 클라이언트 쿠키에서 토큰 정보를 가져옵니다.
  let token = req.cookies.x_auth; //  클라이언트 쿠키들 중 "x_auth" 쿠키

  // 2. 토큰을 복호화한 후 유저 정보를 획득합니다.
  User.findByToken(token, (err, user) => {
    if(err) throw err
    if(!user) return res.json({isAuth: false, error: true})
    req.token = token
    req.user = user
    next()
  })
  // 3. 유저 정보가 DB와 일치하면  Okay!

  // 4. 유저 정보가 DB와 일치하지 않으면 NO!
}

module.exports = { auth };