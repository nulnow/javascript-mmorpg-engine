import React from "react";
import { DefaultWindowController } from "../window-manager/DefaultWindow";
import { useShortPooling } from "../../hooks/useShortPooling";
import { ObjectListItem } from "../ui-components/ui-components";
import type { EditorSceneRunner } from "../Editor";

export class EntitiesListController extends DefaultWindowController {
  public constructor(private sceneRunner: EditorSceneRunner) {
    super();
    this.title.setValue("Entities List");
    this.resizableSubject.setValue(false);
    this.widthHeight.setValue({ width: 150, height: 600 });
    this.renderBody.setValue(() => (
      <EntitiesListView controller={this} sceneRunner={sceneRunner} />
    ));
  }
}

const EntitiesListView: React.FC<{
  controller: EntitiesListController;
  sceneRunner: EditorSceneRunner;
}> = ({ controller, sceneRunner }) => {
  useShortPooling(1, 100, () => Math.random());

  return (
    <>
      {sceneRunner.getEntities().map((entity) => (
        <ObjectListItem
          key={entity.id}
          onClick={() =>
            sceneRunner.selectedEntityBehaviourSubject.setValue(entity)
          }
          style={
            sceneRunner.selectedEntityBehaviourSubject.getValue() === entity
              ? {
                  backgroundColor: "rgb(0,255,4)",
                  color: "black",
                }
              : {}
          }
        >
          {entity.id} {entity.name}
        </ObjectListItem>
      ))}
    </>
  );
};
