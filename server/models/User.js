const mongoose = require('mongoose')
const bcrypt = require("bcrypt");
const saltRounds = 10;
const jwt = require("jsonwebtoken");

const userSchema = mongoose.Schema({
  name : {
    type: String,
    maxlength: 50
  },
  email : {
    type: String,
    trim : true, //  공백(" ")을 제거
    unique: 1
  },
  password: {
    type: String,
    minlength: 5
  },
  lastname: {
    type:String,
    maxlength:50
  },
  role: {
    type: Number,
    default: 0
  },
  image: String,
  token: {
    type: String
  },
  tokenExp: {
    type:Number
  }
})

userSchema.pre("save", function(next){
  var user = this;
  // 만약 'password'가 변경되었을 시
  if(user.isModified('password')){
    // 비밀번호를 암호화 시킨다.
    bcrypt.genSalt(saltRounds, function(err, salt){
      if(err) return next(err);
      bcrypt.hash(user.password, salt, function(err, hash){
        // Store hash in your password DB.
        if(err) return next(err)
        user.password = hash // hash : salt에 의해 암호화된 비밀번호 값
        next()
      })
    })
  } else {
    next()
  }
});

userSchema.methods.comparePassword = function(plainPassword, cb){
  // plainPassword : "abcd1234"
  // securePassword: "$2b$10$zPMmxMPthwOOtprYc.CSr.B0PJxV2rMcg0zM5BWUhB5PMrJU3yLZO"
  // 일반 비밀번호와 암호화된 비밀번호를 상호 체크하기 위해서 일반 비밀번호를 salt를 통해 암호화한 후 두 비밀번호를 비교
  bcrypt.compare(plainPassword, this.password, function(err, isMatch){
    if(err) return cb(err)
    cb(null, isMatch)
  })
}
userSchema.methods.generateToken = function(cb){
  var user = this;
  // jsonwebtoken을 이용해서 token 생성하기
  var token = jwt.sign(user._id.toHexString(), "secretToken") // user._id + "secretToken" 형태의 토큰을 생성
  // 추후에 "secretToken"을 이용하여 user._id의 값을 추출할 수 있습니다.
  user.token = token
  user.save(function(err, user){
    if(err) return cb(err);
    cb(null, user)
  })
}
userSchema.statics.findByToken = function(token, cb){
  var user = this;
  // token decode 작업
  jwt.verify(token, "secretToken", function(err, decoded){
    // secretToken을 통해서 유저 정보를 얻고
    // 클라이언트에서 가져온 token과 DB에 보관된 토큰이 일치하는지 확인
    user.findOne({"_id": decoded, "token": token}, function(err, user){
      if(err) return cb(err)
      cb(null, user)
    })
  })
}

const User = mongoose.model('User', userSchema)
module.exports = { User }