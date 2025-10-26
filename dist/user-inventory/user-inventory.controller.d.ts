import { UserInventoryService } from './user-inventory.service';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { UserInventory } from './user-inventory.schema';
import { ApiResponse as ApiResponseWrapper } from '../common/api-response';
import { CreateFrameRequestDto } from './dto/request/createframerequest.dto';
import { UpdateFrameRequestDto } from './dto/request/updateframerequest.dto';
import { CreateFrameResponseDto } from './dto/response/createframeresponse.dto';
import { UpdateFrameResponseDto } from './dto/response/updateframeresponse.dto';
import { GetFrameResponseDto } from './dto/response/getframeresponse.dto';
import { GetAllFramesResponseDto } from './dto/response/getallframesresponse.dto';
import { DeleteFrameResponseDto } from './dto/response/deleteframeresponse.dto';
import { ExchangeFrameResponseDto } from './dto/response/exchangeframeresponse.dto';
export declare class UserInventoryController {
    private readonly userInventoryService;
    private readonly cloudinaryService;
    constructor(userInventoryService: UserInventoryService, cloudinaryService: CloudinaryService);
    getByUserId(req: any): Promise<ApiResponseWrapper<UserInventory[]>>;
    create(data: Partial<UserInventory>): Promise<ApiResponseWrapper<UserInventory>>;
    getAllFrames(): Promise<ApiResponseWrapper<GetAllFramesResponseDto>>;
    getFrameById(id: string): Promise<ApiResponseWrapper<GetFrameResponseDto>>;
    createFrame(data: CreateFrameRequestDto, file?: Express.Multer.File): Promise<ApiResponseWrapper<CreateFrameResponseDto>>;
    updateFrame(id: string, data: UpdateFrameRequestDto, file?: Express.Multer.File): Promise<ApiResponseWrapper<UpdateFrameResponseDto>>;
    deleteFrame(id: string): Promise<ApiResponseWrapper<DeleteFrameResponseDto>>;
    exchangeFrame(req: any, frameId: string): Promise<ApiResponseWrapper<ExchangeFrameResponseDto>>;
}
