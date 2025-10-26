"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInventoryModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const config_1 = require("@nestjs/config");
const user_inventory_controller_1 = require("./user-inventory.controller");
const user_inventory_service_1 = require("./user-inventory.service");
const user_inventory_repository_1 = require("./user-inventory.repository");
const user_inventory_schema_1 = require("./user-inventory.schema");
const cloudinary_module_1 = require("../common/cloudinary/cloudinary.module");
let UserInventoryModule = class UserInventoryModule {
};
exports.UserInventoryModule = UserInventoryModule;
exports.UserInventoryModule = UserInventoryModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            cloudinary_module_1.CloudinaryModule,
            mongoose_1.MongooseModule.forFeature([
                { name: user_inventory_schema_1.UserInventory.name, schema: user_inventory_schema_1.UserInventorySchema },
                { name: user_inventory_schema_1.Frame.name, schema: user_inventory_schema_1.FrameSchema }
            ])
        ],
        controllers: [user_inventory_controller_1.UserInventoryController],
        providers: [user_inventory_service_1.UserInventoryService, user_inventory_repository_1.UserInventoryRepository],
        exports: [user_inventory_service_1.UserInventoryService, user_inventory_repository_1.UserInventoryRepository],
    })
], UserInventoryModule);
//# sourceMappingURL=user-inventory.module.js.map