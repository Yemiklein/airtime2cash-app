"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const database_config_1 = __importDefault(require("./config/database.config"));
const email_1 = __importDefault(require("./routes/email"));
const cors_1 = __importDefault(require("cors"));
// Swagger
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const swaggerDocument = yamljs_1.default.load('./swagger.yaml');
// ROUTESS
const users_1 = __importDefault(require("./routes/users"));
const accounts_1 = __importDefault(require("./routes/accounts"));
const withdraw_1 = __importDefault(require("./routes/withdraw"));
const transaction_1 = __importDefault(require("./routes/transaction"));
const credit_1 = __importDefault(require("./routes/credit"));
database_config_1.default.sync({})
    .then(() => {
    console.log('Database connected successfully 🚀');
})
    .catch((err) => {
    console.log(err);
});
const app = (0, express_1.default)();
app.use((0, morgan_1.default)('dev'));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false }));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
app.use('/api/mail', email_1.default);
app.use('/user', users_1.default);
app.use('/account', accounts_1.default);
app.use('/cash', withdraw_1.default);
app.use('/transfer', transaction_1.default);
app.use('/wallet', credit_1.default);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocument));
// catch 404 and forward to error handler
// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    // render the error page
    res.status(err.status || 500);
});
exports.default = app;
//# sourceMappingURL=app.js.map