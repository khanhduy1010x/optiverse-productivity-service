"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const friend_schema_1 = require("./friend.schema");
const friend_controller_1 = require("./friend.controller");
const friend_service_1 = require("./friend.service");
const friend_repository_1 = require("./friend.repository");
const axios_client_module_1 = require("../http-axios/axios-client.module");
const user_http_client_1 = require("../http-axios/user-http.client");
let FriendModule = class FriendModule {
};
exports.FriendModule = FriendModule;
exports.FriendModule = FriendModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: friend_schema_1.Friend.name, schema: friend_schema_1.FriendSchema }]),
            axios_client_module_1.AxiosClientModule,
        ],
        controllers: [friend_controller_1.FriendController],
        providers: [friend_service_1.FriendService, friend_repository_1.FriendRepository, user_http_client_1.UserHttpClient],
        exports: [friend_service_1.FriendService, friend_repository_1.FriendRepository],
    })
], FriendModule);
//# sourceMappingURL=friend.module.js.map