import { getArbitraryBaseColor } from '@invoke-ai/ui-library';
import type { CanvasManager } from 'features/controlLayers/konva/CanvasManager';
import { DOCUMENT_FIT_PADDING_PX } from 'features/controlLayers/konva/constants';
import Konva from 'konva';

export class CanvasDocumentSizeOverlay {
  group: Konva.Group;
  outerRect: Konva.Rect;
  innerRect: Konva.Rect;
  padding: number;
  manager: CanvasManager;

  constructor(manager: CanvasManager, padding?: number) {
    this.manager = manager;
    this.padding = padding ?? DOCUMENT_FIT_PADDING_PX;
    this.group = new Konva.Group({ id: 'document_overlay_group', listening: false });
    this.outerRect = new Konva.Rect({
      id: 'document_overlay_outer_rect',
      listening: false,
      fill: getArbitraryBaseColor(10),
      opacity: 0.7,
    });
    this.innerRect = new Konva.Rect({
      id: 'document_overlay_inner_rect',
      listening: false,
      fill: 'white',
      globalCompositeOperation: 'destination-out',
    });
    this.group.add(this.outerRect);
    this.group.add(this.innerRect);
  }

  render() {
    const document = this.manager.stateApi.getDocument();
    this.group.zIndex(0);

    const x = this.manager.stage.x();
    const y = this.manager.stage.y();
    const width = this.manager.stage.width();
    const height = this.manager.stage.height();
    const scale = this.manager.stage.scaleX();

    this.outerRect.setAttrs({
      offsetX: x / scale,
      offsetY: y / scale,
      width: width / scale,
      height: height / scale,
    });

    this.innerRect.setAttrs(document.rect);
  }

  fitToStage() {
    const document = this.manager.stateApi.getDocument();

    // Fit & center the document on the stage
    const width = this.manager.stage.width();
    const height = this.manager.stage.height();
    const docWidthWithBuffer = document.rect.width + this.padding * 2;
    const docHeightWithBuffer = document.rect.height + this.padding * 2;
    const scale = Math.min(Math.min(width / docWidthWithBuffer, height / docHeightWithBuffer), 1);
    const x = (width - docWidthWithBuffer * scale) / 2 + this.padding * scale;
    const y = (height - docHeightWithBuffer * scale) / 2 + this.padding * scale;
    this.manager.stage.setAttrs({ x, y, width, height, scaleX: scale, scaleY: scale });
    this.manager.stateApi.setStageAttrs({ x, y, width, height, scale });
  }
}