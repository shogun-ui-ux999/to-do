import { ConvexReactClient } from "convex/react";
import { resolveConvexUrl } from "./convex-config";

export const convex = new ConvexReactClient(resolveConvexUrl().url);