import { Request } from "express";
import { User } from "../DAL/models/User.model";
import { ImageModel } from "../DAL/models/Image.model";
import { ERoleType } from "../common/enum/user-role.enum";

export interface IUser extends User {
    id: number;
    name: string;
    role: ERoleType;
}


export interface AuthRequest extends Request {
    user?: IUser;
//    img?:IImage
}