var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };

class Playground {

    static CreateLight(position,  scale, rotation, color, name, scene){
        const box = BABYLON.MeshBuilder.CreateBox("box" + name, {width: scale.x, height: scale.y, depth: scale.z});
        const lightMaterial = new BABYLON.StandardMaterial("light mat" + name, scene);
        lightMaterial.disableLighting = true;
        lightMaterial.emissiveColor = color;
        box.material =  lightMaterial;
        
        box.position = position;
        box.rotation = rotation;

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)

        const side_1 = new BABYLON.TransformNode("side_1"+name);
        side_1.parent = box;
        side_1.position.x = scale.x/2;
        side_1.rotation = new BABYLON.Vector3(0,BABYLON.Tools.ToRadians(-90),0);
        side_1.scaling = new BABYLON.Vector3(scale.z, scale.y, scale.x);

        var light = new BABYLON.RectAreaLight("light" + name, new BABYLON.Vector3(0, 0, 0), 1, 1, scene);
        light.parent = side_1;
        light.specular = color;
        light.diffuse = color;

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;
        return box;
    }

    static CreateScene(engine, canvas) {
        // This creates a basic Babylon Scene object (non-mesh)
        var scene = new BABYLON.Scene(engine);

        // This creates and positions a free camera (non-mesh)
        //var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 10, 0), scene);

        var camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(90), BABYLON.Tools.ToRadians(40), 10, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);

        // This targets the camera to scene origin
        camera.setTarget(BABYLON.Vector3.Zero());

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.1;

        //var paddle_l = BABYLON.MeshBuilder.CreateBox("box", {height: .2, width: .2, depth: 1}, scene);
        //paddle_l.position.y = 1;
        //paddle_l.position.x = 2.7;
        //var paddle_r = BABYLON.MeshBuilder.CreateBox("box", {height: .2, width: .2, depth: 1}, scene);
        //paddle_r.position.y = 1;
        //paddle_r.position.z = 1;
        //paddle_r.position.x = -2.7;

        let paddle_L = Playground.CreateLight(new BABYLON.Vector3(2.7,.1,0), new BABYLON.Vector3(0.2,0.2,1), new BABYLON.Vector3(0,3.14,0), new BABYLON.Color3(1,0,0), "paddle_L", scene)
        let paddle_R = Playground.CreateLight(new BABYLON.Vector3(-2.7,.1,1), new BABYLON.Vector3(0.2,0.2,1), new BABYLON.Vector3(0,0,0), new BABYLON.Color3(0,1,0), "paddle_R", scene)
        
        let ball = Playground.CreateLight(new BABYLON.Vector3(0,.1,0), new BABYLON.Vector3(0.2,0.2,0.2), new BABYLON.Vector3(0,-1.6,0), new BABYLON.Color3(1,1,1), "ball", scene);

        // Our built-in 'ground' shape. Params: name, options, scene
        var ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);
        const groundMaterial = new BABYLON.StandardMaterial("Ground Material", scene);
        groundMaterial.diffuseColor = new BABYLON.Color3(.3, .7, .6);
        let groundTexture = new BABYLON.Texture(Assets.textures.checkerboard_basecolor_png.path, scene);
        groundMaterial.diffuseTexture = groundTexture;
        ground.material = groundMaterial;

        var time = 0;
        var localTime = 1;
        scene.onBeforeRenderObservable.add(()=>{
            if (localTime >= 1)
            {
                // tick every 1 second
                localTime = 0;
            }

            console.log("ball at " + GameState.ballX + ", " + GameState.ballY + "\n" + 
                        "player_L at " + GameState.playerX + ", " + GameState.playerY + "\n" +
                        "player_R at " + GameState.aiX + ", " + GameState.aiY + "\n");

                // const sc = Math.max(Math.cos(time * Math.PI - Math.abs(i - 4)*0.2) - 0.8, 0) * 4 + 1.5;;
                // boxes[i].scaling.y = sc;

                // boxes[i].material.emissiveColor.r = 0.6 + sc * 0.3;

            const sc = Math.max(Math.cos(time * Math.PI - Math.abs(1 - 4)*0.2) - 0.8, 0) * 4 + 1.5;;
            ball.scaling.y = sc;
            ball.material.emissiveColor.r = 0.6 + sc * 0.3;

            //BallX 150-1250
            // -150
            //0 - 1100 //275
            ball.position.x = 2-(GameState.ballX-150)/275;
            ball.position.z = (GameState.ballY/205 - 2);

            paddle_L.position.z = (GameState.playerY/205 - 2);
            paddle_R.position.z = (GameState.aiY/205 - 2);

            camera.alpha += Math.cos(time* 0.1) * 0.0003;
            camera.beta += Math.cos(time * 0.16) * 0.00035;
            var dt = engine.getDeltaTime() * 0.0016;
            localTime += dt;
            time += dt;
        });

        return scene;
    }

    // static UpdateScene(engine, canvas) {
    //     console.log("ball at " + GameState.ballX + ", " + GameState.ballY + "\n" + 
    //                 "player_L at " + GameState.playerX + ", " + GameState.playerY + "\n" +
    //                 "player_R at " + GameState.aiX + ", " + GameState.aiY + "\n");
    // }
}

createScene = function() { return Playground.CreateScene(engine, engine.getRenderingCanvas()); }
window.initFunction = async function() {
    
    var asyncEngineCreation = async function() {
        try {
        return createDefaultEngine();
        } catch(e) {
        console.log("the available createEngine function failed. Creating the default engine instead");
        return createDefaultEngine();
        }
    }

    window.engine = await asyncEngineCreation();
    
    const engineOptions = window.engine.getCreationOptions?.();
    if (!engineOptions || engineOptions.audioEngine !== false) {
        
    }
    if (!engine) throw 'engine should not be null.';
    engine.runRenderLoop(() => {
        if (sceneToRender && sceneToRender.activeCamera) {
            // Playground.UpdateScene(engine, canvas);
            sceneToRender.render();
        }
    });
    window.scene = createScene();
};

initFunction().then(() => {sceneToRender = scene});

window.addEventListener("resize", function () { engine.resize(); });