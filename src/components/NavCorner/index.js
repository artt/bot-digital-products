import React from "react"
import Button from '@mui/material/Button';
import styles from "./styles.module.scss"

export default function NavCorner({ selection, setInfoBoxOpen }) {
  return(
    <div className={styles.container}>
      <Button
        variant="contained"
        disabled={!selection}
        onClick={() => setInfoBoxOpen(true)}
      >
        Info
      </Button>
    </div>
  )
}