import {TextField, Box, Button} from '@mui/material';
import {styled} from '@mui/material/styles';

export const FormStyled = styled("form")`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
`;

export const ButtonStyled = styled(Button)`
  width: 100%;
  height: 40px;
  background-color: #1976d2;
  color: white;
  &:hover {
    background-color: #115293;
  }
`