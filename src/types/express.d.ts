
// import { Request } from "express";
// import * as express from 'express';

// declare module "express-serve-static-core" {
//   interface Request {
//     user?: {
//       emailAddress: ((email: any, newOrder: Document<unknown, {}, IOrder> & IOrder & Required<{ _id: Types.ObjectId; }> & { __v: number; }) => unknown) | undefined;
//       email(email: any, newOrder: Document<unknown, {}, IOrder> & IOrder & Required<{ _id: Types.ObjectId; }> & { __v: number; }): unknown;
//       _id: any; 
//       id: string;
//        role?: string;
      

// };
//   }
// }

// interface AuthRequest extends Request {
//   user?: {
//     id:any;
//     id: string;
//     role?: string;
//   };
// }
// import jwt from 'jsonwebtoken';
// import { Document, Types } from "mongoose";

// interface Request {
//   user?: { 
//     id: string; 
//     _id: string;
//     role?: string;
//      email?: string | undefined
//     };
// }
// declare module "express-serve-static-core" {
//   interface Request {
//     user?: {
//       email: string | undefined;  // Change this to string or undefined
//       _id: any;
//       id: string;
//       role?: string;
//     };
//   }
// }


// declare global {
//   namespace Express {
//     interface Request {
//       user?: RequestUser;
//     }
//   }
// }


// interface Variation {
//   color: string;
//   size: string;
//   thickness: string;
//   quantity: number;
//   price: number;
//   colorName: string;
//   colorValue: string;
// }



import { Request } from "express";
import { Document, Types } from "mongoose";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      [x: string]: any;
      
      email: string | undefined;
      emailAddress?: string;  // Make emailAddress optional if it's not always needed
      _id: any;
      id: string;
      role?: string;
    };
  }
}




// Additional interface for request with `user` property, if needed in your specific case.
interface RequestUser extends Request {
  user?: {
    id: string;
    _id: string;
    role?: string;
    email?: string; // Ensure that email is a string
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser['user'];  // Ensures proper reference to the user field structure
    }
  }
}

interface AuthRequest extends Request {
  user?: {
    id:any;
    id: string;
    role?: string;
  };
}
// Variation interface, assuming it's used somewhere in your app
interface Variation {
  color: string;
  size: string;
  thickness: string;
  quantity: number;
  price: number;
  colorName: string;
  colorValue: string;
}
