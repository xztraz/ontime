import { Icon } from '@chakra-ui/react';
import { useState } from 'react';
import { FiChevronUp } from 'react-icons/fi';
import style from './Info.module.scss';

export default function InfoTitle(props) {
  const [collapsed, setCollapsed] = useState(false);

  const { title, data, roll } = props;

  const noTitl = data.title == null || data.title === '';
  const noPres = data.presenter == null || data.presenter === '';
  const noSubt = data.subtitle == null || data.subtitle === '';
  const noNote = data.note == null || data.note === '';

  return (
    <div className={style.container}>
      <div className={roll ? style.headerRoll : style.header}>
        {title}
        {collapsed && (
          <span className={style.collapsedTitle}>{data.title}</span>
        )}
        <Icon
          className={collapsed ? style.moreCollapsed : style.moreExpanded}
          as={FiChevronUp}
          onClick={() => setCollapsed((c) => !c)}
        />
      </div>

      {!collapsed && (
        <>
          <div className={style.labelContainer}>
            <span className={noTitl ? style.emptyLabel : style.label}>
              Title
            </span>
            {data.title}
          </div>
          <div className={style.labelContainer}>
            <span className={noPres ? style.emptyLabel : style.label}>
              Presenter
            </span>
            {data.presenter}
          </div>
          <div className={style.labelContainer}>
            <span className={noSubt ? style.emptyLabel : style.label}>
              Subtitle
            </span>
            {data.subtitle}
          </div>
          <div className={style.notes}>
            <span className={noNote ? style.emptyLabel : style.label}>
              Note
            </span>
            {data.note}
          </div>
        </>
      )}
    </div>
  );
}
