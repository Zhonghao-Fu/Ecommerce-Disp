/**
 * Multer file upload middleware configuration
 * Handles image uploads for product photos
 */

import multer from 'multer'
import path from 'path'
import fs from 'fs'
import type { Request } from 'express'

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/products')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
  console.log(`✅ Upload directory created: ${uploadDir}`)
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir)
  },
  filename: (req: Request, file: Express.Multer.File, cb) => {
    // Generate unique filename: timestamp-randomNumber.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, uniqueSuffix + ext)
  }
})

// File filter - only allow images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (mimetype && extname) {
    cb(null, true)
  } else {
    cb(null, false)
    // Error will be handled by multer's fileFilter error mechanism
  }
}

// Multer configuration for images
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter
})

// CSV file filter
const csvFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = ['text/csv', 'application/csv', 'application/vnd.ms-excel']
  const extname = path.extname(file.originalname).toLowerCase() === '.csv'
  
  if (allowedTypes.includes(file.mimetype) || extname) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

// Multer configuration for CSV files
export const uploadCSV = multer({
  storage: multer.memoryStorage(),  // Store in memory for CSV processing
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: csvFileFilter
})

// Error handling middleware for multer errors
export const handleMulterError = (err: any, req: Request, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: '文件大小不能超过 5MB'
        }
      })
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: err.message
      }
    })
  } else if (err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: err.message
      }
    })
  }
  next()
}
