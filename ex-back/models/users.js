import { Schema, model, ObjectId, Error } from 'mongoose'
import validator from 'validator'
// bcrypt => 密碼雜湊函數，使用一個加鹽的流程加密密碼
import bcrypt from 'bcrypt'
import UserRole from '../enums/UserRole.js'

const cartSchema = new Schema({
  product: {
    type: ObjectId,
    // ref 參照 : '參照對象'
    ref: 'products',
    required: [true, '缺少商品欄位']
  },
  quantity: {
    type: Number,
    required: [true, '缺少商品數量']
  }
})

const schema = new Schema({
  account: {
    type: String,
    required: [true, '缺少使用者帳號'],
    minlength: [4, '使用者帳號長度不符'],
    maxlength: [20, '使用者帳號長度不符'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isAlphanumeric(value)
      },
      message: '使用者帳號格式錯誤'
    }
  },
  email: {
    type: String,
    required: [true, '缺少使用者信箱'],
    unique: true,
    validate: {
      validator (value) {
        return validator.isEmail(value)
      },
      message: '使用者信箱格式錯誤'
    }
  },
  password: {
    type: String,
    required: [true, '缺少使用者密碼']
  },
  tokens: {
    type: [String]
  },
  cart: {
    type: [cartSchema]
  },
  role: {
    type: Number,
    default: UserRole.USER
  }
}, {
  // 紀錄資料建立日期及最後更新日期
  timestamps: true,
  // 關掉__v => 不儲存資料更改次數
  versionKey: false
})

schema.virtual('cartQuantity')
  .get(function () {
    return this.cart.reduce((total, current) => {
      return total + current.quantity
    }, 0)
  })

// schema.pre('save', function () {} => 讓 schema 在 save 前先執行 function
// 不能用箭頭函式，因為會使用到this，箭頭函式沒有this
schema.pre('save', function (next) {
  const user = this
  // user.isModified('password') => isModified=如果修改 => 如果 user 的 password 修改 = true，則執行{}
  if (user.isModified('password')) {
    // 先驗證修改後的密碼長度，才能進行加密(加密後密碼長度會改變)
    if (user.password.length < 4 || user.password.length > 20) {
      // 如果密碼長度 <4 或 >20，回傳驗證錯誤
      const error = new Error.ValidationError(null)
      error.addError('password', new Error.ValidatorError({ message: '密碼長度不符' }))
      next(error)
      return
    } else {
      // bcrypt.hashSync(加密目標字串, 加鹽次數<越高越安全，但也越耗時>) ，加鹽 => 在要加密的字串中加特定的字符，打亂原始的字符串
      // bcrypt.hashSync(user.password, 10) => 對 user.password 進行同步加密，
      user.password = bcrypt.hashSync(user.password, 10)

      /* 補充：bcrypt 加密有分同步&非同步 (同步=>一次只處理一件事，完成後才執行下一件；非同步=>例如setTimeout()，先開始不一定先完成)
      bcrypt.hashSync(加密目標字串, 加鹽次數)=> 回傳的是加密後的字串
      bcrypt.hash(加密目標字串, 加鹽次數)=> 回傳的是Promise
      */
    }
  }
  // 完成後進行下一步，如果沒寫這個會停在這裡
  next()
})

export default model('users', schema)
