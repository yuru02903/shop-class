import { Router } from 'express'
import * as auth from '../middlewares/auth.js'
import { create, getAll, edit, get, getId } from '../controllers/products.js'
import upload from '../middlewares/upload.js'
import admin from '../middlewares/admin.js'

const router = Router()

// () 是 post 前的判斷內容 => 首頁>是否登入>權限是否為管理員>是否上傳>呼叫 create function
router.post('/', auth.jwt, admin, upload, create)
// () 是 get(取得資料)前的判斷內容 => 全部商品頁>是否登入>權限是否為管理員>呼叫 getAll function
router.get('/all', auth.jwt, admin, getAll)
router.patch('/:id', auth.jwt, admin, upload, edit)
router.get('/', get)
router.get('/:id', getId)

export default router
