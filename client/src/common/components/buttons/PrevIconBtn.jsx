import { IconButton } from '@chakra-ui/button';
import { FiSkipBack } from 'react-icons/fi';

export default function PrevIconBtn(props) {
  const { clickhandler, ...rest } = props;
  return (
    <IconButton
      icon={<FiSkipBack />}
      colorScheme='whiteAlpha'
      backgroundColor='#ffffff11'
      variant='outline'
      onClick={clickhandler}
      width={90}
      _focus={{ boxShadow: 'none' }}
      {...rest}
    />
  );
}
