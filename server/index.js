const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose')
const {User} = require("./models/User");
const config = require("./config/key");
const { auth } = require('./middleware/auth');

// application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));
// application/json
app.use(express.json());
app.use(cookieParser());

mongoose.connect(config.mongoURI,{
  useNewUrlParser: true, useUnifiedTopology: true
}).then(()=> console.log("MongoDB Connected..."))
  .catch(err=>console.log(err))

app.get('/', (req, res) => {
  res.send('Hello World! 안녕하세요!')
})

app.get('/api/hello', (req,res)=>{
  res.send("반갑습니다!")
})

// Register < Route >
app.post('/api/users/register', (req, res) => {
  // 회원 가입할 때 필요한 정보들을 client에서 가져오면 그것들을 데이터 베이스에 넣어준다.
  const user = new User(req.body);

  user.save((err, userInfo) => {
    if (err) return res.json({success: false, err})
    return res.status(200).json({
      success: true
    })
  })
})

// Login < Route >
app.post('/api/users/login', (req, res) => {
  // 1. 요청된 이메일이 데이터베이스에 존재하는지 확인
  User.findOne({ email : req.body.email }, (err, user) => {
    if(!user){
      return res.json({
        loginSuccess : false,
        message : "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
    // 2. 요청된 이메일이 존재한다면 요청된 비밀번호가 이메일과 일치하는지 확인
    user.comparePassword(req.body.password, (err, isMatch) =>{
      if(!isMatch){
        return res.json({
          loginSuccess: false,
          message: "비밀번호가 틀렸습니다."
        })
      }
      // 3. 위의 요구사항이 모두 일치한다면 토큰을 생성
      user.generateToken((err, user)=>{
        if(err) return res.status(400).send(err);
        // 토큰을 !쿠키! or 세션 or 로컬스토리지 에 저장한다.
        res.cookie("x_auth",user.token)
        .status(200)
        .json({ loginSuccess: true, userId: user._id })
      })
    })
  })
})

// 인증 기능
app.get('/api/users/auth', auth, (req, res) => {
  // 여기까지 미들웨어를 통과해 왔다는 애기는 Authentication 이 True 라는 말
  res.status(200).json({
    _id : req.user._id,
    isAdmin : req.user.role === 0 ? false : true,
    isAuth: true,
    email : req.user.email,
    name : req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})

// 로그아웃
app.get('/api/users/logout', auth, (req, res) => {
  // auth의 현재 _id를 이용하여 DB의 데이터를 찾아 token의 값을 ""로 바꾸어 줍니다.
  User.findOneAndUpdate({ _id : req.user._id},
    { token : "" }
    ,(err, user) => {
    if(err) return res.json({ success: false, err});
    return res.status(200).send({
      success: true
    })
  })
})

const port = 5000
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})