"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoteModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const note_schema_1 = require("./note.schema");
const note_controller_1 = require("./note.controller");
const note_service_1 = require("./note.service");
const note_repository_1 = require("./note.repository");
const note_gateway_1 = require("./note.gateway");
const share_repository_1 = require("../shares/share.repository");
const share_schema_1 = require("../shares/share.schema");
let NoteModule = class NoteModule {
};
exports.NoteModule = NoteModule;
exports.NoteModule = NoteModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: note_schema_1.Note.name, schema: note_schema_1.NoteSchema },
                { name: share_schema_1.Share.name, schema: share_schema_1.ShareSchema },
            ]),
        ],
        controllers: [note_controller_1.NoteController],
        providers: [note_service_1.NoteService, note_repository_1.NoteRepository, note_gateway_1.NoteGateway, share_repository_1.ShareRepository],
        exports: [note_service_1.NoteService, note_repository_1.NoteRepository, note_gateway_1.NoteGateway],
    })
], NoteModule);
//# sourceMappingURL=note.module.js.map