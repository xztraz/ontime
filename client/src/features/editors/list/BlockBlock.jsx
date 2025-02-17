import { Draggable } from 'react-beautiful-dnd';
import { FiMoreVertical } from 'react-icons/fi';
import DeleteIconBtn from 'common/components/buttons/DeleteIconBtn';
import ActionButtons from './ActionButtons';
import style from './BlockBlock.module.css';

export default function BlockBlock(props) {
  const { index, data, actionHandler } = props;

  return (
    <Draggable key={data.id} draggableId={data.id} index={index}>
      {(provided) => (
        <div
          className={style.block}
          {...provided.draggableProps}
          ref={provided.innerRef}
        >
          <span className={style.drag} {...provided.dragHandleProps}>
            <FiMoreVertical />
          </span>
          <div className={style.actionOverlay}>
            <DeleteIconBtn actionHandler={actionHandler} />
            <ActionButtons showAdd showDelay actionHandler={actionHandler} />
          </div>
        </div>
      )}
    </Draggable>
  );
}
