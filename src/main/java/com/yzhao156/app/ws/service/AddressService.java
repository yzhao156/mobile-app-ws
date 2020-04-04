package com.yzhao156.app.ws.service;

import java.util.List;

import com.yzhao156.app.ws.shared.dto.AddressDTO;

public interface AddressService {
	List<AddressDTO> getAddresses(String userId);
	AddressDTO getAddress(String addressId);
}
