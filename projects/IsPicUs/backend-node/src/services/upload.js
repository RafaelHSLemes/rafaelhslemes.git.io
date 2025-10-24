import multer from 'multer';
import { S3Client } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const provider = (process.env.UPLOAD_PROVIDER || 'cloudinary').toLowerCase();

export const makeUploader = () => {
  if (provider === 's3') {
    const s3 = new S3Client({ region: process.env.AWS_REGION });
    const storage = multerS3({
      s3,
      bucket: process.env.S3_BUCKET,
      acl: 'public-read',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: (_req, file, cb) => {
        const ext = file.originalname.split('.').pop();
        cb(null, `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
      },
    });
    return multer({ storage });
  }

  cloudinary.v2.config(process.env.CLOUDINARY_URL);
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: async (_req, file) => ({
      folder: 'ispicus',
      resource_type: 'image',
      public_id: `${Date.now()}-${file.originalname.replace(/\W+/g, '-')}`
    })
  });
  return multer({ storage });
};

