import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contratosRouter from "./contratos";
import fornecedoresRouter from "./fornecedores";
import aditivosRouter from "./aditivos";
import medicoesRouter from "./medicoes";
import alertasRouter from "./alertas";
import dashboardRouter from "./dashboard";
import pncpRouter from "./pncp";
import comprasnetRouter from "./comprasnet";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/contratos", contratosRouter);
router.use("/fornecedores", fornecedoresRouter);
router.use("/aditivos", aditivosRouter);
router.use("/medicoes", medicoesRouter);
router.use("/alertas", alertasRouter);
router.use("/dashboard", dashboardRouter);
router.use("/pncp", pncpRouter);
router.use("/comprasnet", comprasnetRouter);

export default router;
