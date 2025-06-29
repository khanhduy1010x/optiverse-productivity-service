"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewSessionModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const review_session_schema_1 = require("./review-session.schema");
const review_session_controller_1 = require("./review-session.controller");
const review_session_service_1 = require("./review-session.service");
const review_session_repository_1 = require("./review-session.repository");
let ReviewSessionModule = class ReviewSessionModule {
};
exports.ReviewSessionModule = ReviewSessionModule;
exports.ReviewSessionModule = ReviewSessionModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: review_session_schema_1.ReviewSession.name, schema: review_session_schema_1.ReviewSessionSchema }])],
        controllers: [review_session_controller_1.ReviewSessionController],
        providers: [review_session_service_1.ReviewSessionService, review_session_repository_1.ReviewSessionRepository],
        exports: [review_session_service_1.ReviewSessionService],
    })
], ReviewSessionModule);
//# sourceMappingURL=review-session.module.js.map