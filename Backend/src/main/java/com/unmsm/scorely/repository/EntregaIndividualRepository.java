package com.unmsm.scorely.repository;

import com.unmsm.scorely.models.EntregaIndividual;
import jakarta.persistence.criteria.CriteriaBuilder;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EntregaIndividualRepository  extends JpaRepository <EntregaIndividual, Integer> {
}
