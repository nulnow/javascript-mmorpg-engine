import React from "react";
import { DefaultWindowController } from "../window-manager/DefaultWindow";
import type { EditorSceneRunner } from "../Editor";
import { BehaviourSubject } from "../../../shared/behaviour-subject/BehaviourSubject";
import { useBehaviourSubject } from "../../bin/start-client";
import { BaseEntity } from "../../../shared/entity/BaseEntity";
import { SimpleGameObject } from "../../../shared/game-object/SimpleGameObject";
import { IEntityManager } from "../../../shared/entity-manager/IEntityManager";
import { AssetManager } from "../../../shared/asset-manager/AssetManager";
import { SpriteGameObject } from "../../../shared/game-object/SpriteGameObject";

export class LibraryController extends DefaultWindowController {
  public libraryItemsSubject = new BehaviourSubject([
    {
      type: "Square",
      name: "Square",
      description: "Yellow square",
      initializeEntity: (entityManager: IEntityManager) => {
        const entity = new BaseEntity(
          entityManager,
          Math.round(Math.random() * 10000),
        );
        entity.speedPixInSecond = 0;

        entity.name = "Yellow square";
        entity.gameObject = new SimpleGameObject("rgb(192,185,59)", 100, 100);

        return entity;
      },
    },
    {
      type: "Slime",
      name: "Slime",
      description: "A Slime",
      initializeEntity: (entityManager: IEntityManager) => {
        const entity = new BaseEntity(
          entityManager,
          Math.round(Math.random() * 10000),
        );
        entity.speedPixInSecond = 0;

        entity.name = "Slime";
        entity.gameObject = new SpriteGameObject(
          "slime",
          100,
          100,
          ["move", 0],
          0.5,
          AssetManager,
        );
        return entity;
      },
    },
  ]);

  public constructor(private sceneRunner: EditorSceneRunner) {
    super();
    this.title.setValue("Library");
    this.resizableSubject.setValue(true);
    this.widthHeight.setValue({ width: window.innerWidth, height: 200 });

    const LibraryView: React.FC<{
      controller: LibraryController;
      sceneRunner: EditorSceneRunner;
    }> = ({ controller, sceneRunner }) => {
      const libraryItems = useBehaviourSubject(controller.libraryItemsSubject);

      return (
        <div className="flex gap-4">
          {libraryItems.map((item) => {
            return (
              <div key={item.name}>
                <div
                  className="hover:bg-gray-500"
                  draggable={true}
                  style={{ width: 80, height: 80, border: "1px solid gray" }}
                  onDragEnd={(event) => {
                    const canvas = sceneRunner.getCanvas();
                    const { x, y } = canvas.getBoundingClientRect();
                    const { clientX, clientY } = event;

                    const entityManager = sceneRunner.getServerEntityManager();
                    const entity = item.initializeEntity(entityManager);

                    const relativeX = clientX - x;
                    const relativeY = clientY - y;

                    entity.position = [relativeX, relativeY];

                    entityManager.addEntity(entity);
                  }}
                ></div>
                <p className="text-sm">{item.name}</p>
                <p className="text-xs">{item.description}</p>
              </div>
            );
          })}
        </div>
      );
    };

    this.renderBody.setValue(() => (
      <LibraryView controller={this} sceneRunner={sceneRunner} />
    ));
  }
}
