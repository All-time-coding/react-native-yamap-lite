#pragma once

#ifdef __cplusplus

#include <cstddef>
#include <vector>

namespace yamaplite {

template <typename Coord>
inline bool latLonEqual(const Coord &a, const Coord &b) {
  return a.lat == b.lat && a.lon == b.lon;
}

template <typename Coord>
inline bool pointsEqual(const std::vector<Coord> &lhs,
                        const std::vector<Coord> &rhs) {
  if (lhs.size() != rhs.size()) {
    return false;
  }
  for (size_t i = 0; i < lhs.size(); ++i) {
    if (!latLonEqual(lhs[i], rhs[i])) {
      return false;
    }
  }
  return true;
}

template <typename Coord>
inline bool ringsEqual(const std::vector<std::vector<Coord>> &lhs,
                       const std::vector<std::vector<Coord>> &rhs) {
  if (lhs.size() != rhs.size()) {
    return false;
  }
  for (size_t i = 0; i < lhs.size(); ++i) {
    if (!pointsEqual(lhs[i], rhs[i])) {
      return false;
    }
  }
  return true;
}

} // namespace yamaplite

#endif
