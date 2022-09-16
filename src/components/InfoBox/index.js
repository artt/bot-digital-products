import React from "react"
import Dialog, { DialogProps } from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

export default function InfoBox({ selection, setSelection, ...rest }) {

  if (!selection)
    return null

  return(
    <Dialog {...rest}>
      <DialogTitle>{selection.name}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {selection.description ||
            "Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel dolore saepe obcaecati quos recusandae provident eos earum laborum voluptatem perferendis sed, aliquid consequatur nihil fugit quod nulla dolores rerum modi."
          }
        </DialogContentText>
      </DialogContent>
    </Dialog>
  )

}