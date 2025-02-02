declare global {
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: typeof import("mongoose") | null;
        promise: Promise<typeof import("mongoose")> | null;
      };
    }
  }
}

// Necessary to make the file a module.
export {};
