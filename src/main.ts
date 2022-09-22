import "./app.css";
import App from "./App.svelte";

const app = new App({
  target: document.getElementById("app")!,
});

export default app;

/* ---------------------------------- TEST ---------------------------------- */

type SMARTPHONE_MAP_TYPE = {[key: string]: {displaySize: number, weight: string}}

const SMARTPHONE_MAPPING = {
  IPHONE_12 : {displaySize:   6.06,  weight: "164g"},
  GALAXY_S22: {displaySize:   6.1,   weight: "168g"},
} satisfies SMARTPHONE_MAP_TYPE;