import { env } from './env'
import rpc from './rpc.config'

const configs = {
  rpc: rpc[env],
}

/**
 * Module exports
 */
export default configs
