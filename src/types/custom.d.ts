declare namespace Express {
    export interface Request {
      user: {
        id: string;
        role?: string;
      };
    }
  }

  declare global {
    namespace Express {
      interface Request {
        user?: { id: string; role?: string };
      }
    }
  }