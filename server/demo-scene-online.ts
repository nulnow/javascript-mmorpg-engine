import { runServer } from "./Server";
import { MainMod } from "./mods/main-mod/mod";

runServer(new MainMod(), 3000);
