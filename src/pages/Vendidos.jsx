import { useNavigate } from 'react-router-dom'
import { useStore } from '../store.jsx'
import { PageTitle, Grid, Empty, Loading, useFadeIn } from '../components/ui.jsx'

export default function Vendidos() {
  const nav = useNavigate()
  const { sold, loaded } = useStore()
  useFadeIn([sold.length])
  return (
    <>
      <PageTitle title="Vendidos" />
      <div className="container page-wrap">
        <div className="sec-head">
          <h2 className="tabs-title"><small>Confían en KLOW</small>{sold.length} {sold.length === 1 ? 'producto entregado' : 'productos entregados'}</h2>
          <button className="see-all" onClick={() => nav('/encargos')}>¿Querés alguno? Encargalo <i className="fa fa-angle-right" /></button>
        </div>
        {!loaded ? <Loading /> : sold.length === 0 ? <Empty title="Todavía no hay vendidos cargados" text="Pronto vas a ver acá lo que ya entregamos." /> : <Grid items={sold} />}
      </div>
    </>
  )
}
