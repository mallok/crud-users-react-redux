import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

export class Users extends React.PureComponent {
  static propTypes = {
    prop: PropTypes
  }

  render() {
    return (
      <div>
      Users
      </div>
    )
  }
}

const mapStateToProps = (state) => ({

})

const mapDispatchToProps = {

}

export default connect(mapStateToProps, mapDispatchToProps)(Users)
