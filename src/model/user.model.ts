// Modules
import {
  DocumentType,
  Severity,
  getModelForClass,
  index,
  modelOptions,
  pre,
  prop,
} from "@typegoose/typegoose";
import { nanoid } from "nanoid";
import argon2 from "argon2";

// Utils
import log from "../utils/logger";

// Private fields that should not be exposed in the response
export const privateFields = [
  "password",
  "__v",
  "verificationCode",
  "passwordResetCode",
  "verified",
];

@pre<User>("save", async function () {
  // Execute this function before saving a User document
  if (!this.isModified("password")) {
    // If the password has not been modified, skip hashing it and continue with saving
    return;
  }

  // Hash the password using Argon2
  const hash = await argon2.hash(this.password);

  this.password = hash;

  return;
})
@index({ email: 1 })
@modelOptions({
  schemaOptions: {
    timestamps: true,
  },
  options: {
    allowMixed: Severity.ALLOW,
  },
})
export class User {
  @prop({ lowercase: true, required: true, unique: true })
  email: string;

  @prop({ required: true })
  firstName: string;

  @prop({ required: true })
  lastName: string;

  @prop({ required: true })
  password: string;

  @prop({ required: true, default: () => nanoid() })
  verificationCode: string;

  @prop()
  passwordResetCode: string | null;

  @prop({ default: false })
  verified: boolean;

  async validatePassword(this: DocumentType<User>, candidatePassword: string) {
    // Method to validate whether a given password matches the hashed password stored in the database
    try {
      return await argon2.verify(this.password, candidatePassword);
    } catch (e) {
      log.error(e, "Could not validate password!");
      return false;
    }
  }
}

// Get the UserModel for interacting with the User collection in the database
const UserModel = getModelForClass(User);

export default UserModel;
